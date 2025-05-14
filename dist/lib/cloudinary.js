import { v2 as cloudinary } from "cloudinary";
import PDFDocument from "pdfkit";
import streamifier from "streamifier";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
export async function uploadToCloudinary(file, folder) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({
            folder: folder,
        }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result.secure_url);
        })
            .end(file);
    });
}
export async function generatePdfAndUploadToCloudinary(data) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", async () => {
            const pdfBuffer = Buffer.concat(buffers);
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: "Hospital/Prescriptions",
                resource_type: "raw",
            }, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result?.secure_url);
            });
            streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
        });
        doc.fontSize(20).text("Prescription", { align: "center" }).moveDown();
        doc.fontSize(12).text(`Doctor: Dr. ${data.doctorName}`);
        doc.text(`Patient: ${data.patientName}`);
        doc.text(`Illness: ${data.illness}`);
        doc.text(`Surgery History: ${data.surgery}`);
        doc.text(`Diabetes Status: ${data.diabetesStatus}`);
        doc.text(`Allergies: ${data.allergies}`).moveDown();
        doc.fontSize(14).text("Care Instructions:", { underline: true });
        doc.text(data.care).moveDown();
        if (data.medicines) {
            doc.fontSize(14).text("Medicines:", { underline: true });
            doc.text(data.medicines);
        }
        doc.end();
    });
}
export default cloudinary;
