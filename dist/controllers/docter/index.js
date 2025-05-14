import { db } from "../../lib/db.js";
import PDFDocument from "pdfkit";
import streamifier from "streamifier";
import cloudinary from "../../lib/cloudinary.js";
export async function sendPdf(req, res) {
    try {
        const { consultationId } = req.params;
        const consultation = await db.consultation.findUnique({
            where: { id: consultationId },
            include: { prescription: true, Patient: true, Doctor: true },
        });
        if (!consultation || !consultation.prescription) {
            res.status(404).json({ error: "Consultation or prescription not found" });
            return;
        }
        // Create PDF
        const doc = new PDFDocument();
        let buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", async () => {
            const pdfBuffer = Buffer.concat(buffers);
            const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "raw", folder: "prescriptions" }, async (err, result) => {
                if (err || !result) {
                    return res
                        .status(500)
                        .json({ error: "Cloudinary upload failed", details: err });
                }
                // Update PDF URL in DB
                await db.prescription.update({
                    where: { id: consultation.prescription.id },
                    data: { pdfUrl: result.secure_url },
                });
                return res.status(200).json({
                    message: "PDF generated & uploaded",
                    url: result.secure_url,
                });
            });
            streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
        });
        // Writing PDF content
        doc.fontSize(20).text("Prescription", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Doctor: ${consultation.Doctor.name}`);
        doc.text(`Patient: ${consultation.Patient.name}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.text(`Illness History: ${consultation.step1Illness}`);
        doc.text(`Surgery History: ${consultation.step1Surgery}`);
        doc.text(`Diabetes: ${consultation.diabetesStatus}`);
        doc.text(`Allergies: ${consultation.allergies}`);
        doc.text(`Others: ${consultation.others}`);
        doc.moveDown();
        doc.text(`Care: ${consultation.prescription.care}`);
        doc.text(`Medicines: ${consultation.prescription.medicines}`);
        doc.end(); // End writing to the PDF
    }
    catch (error) {
        console.error("PDF Generation Error:", error);
        res
            .status(500)
            .json({ error: "Something went wrong", details: error.message });
    }
}
