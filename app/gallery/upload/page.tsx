"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiUpload, FiArrowLeft, FiImage, FiVideo, FiX } from "react-icons/fi";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "../../components/ProtectedRoute";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";

export default function AddMediaPage() {
  const router = useRouter();
  const [mediaType, setMediaType] = useState<"photo" | "video">("photo");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const fileType = droppedFile.type.split("/")[0];
      if ((mediaType === "photo" && fileType === "image") || 
          (mediaType === "video" && fileType === "video")) {
        handleFileSelection(droppedFile);
      } else {
        toast.error(`File harus berupa ${mediaType === "photo" ? "gambar" : "video"}!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      handleFileSelection(uploaded);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    // Validasi ukuran file
    const maxSize = mediaType === "photo" ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB untuk foto, 50MB untuk video
    if (selectedFile.size > maxSize) {
      toast.error(`Ukuran file terlalu besar! Maksimal ${mediaType === "photo" ? '10MB' : '50MB'}`, {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    
    toast.success(`File "${selectedFile.name}" berhasil dipilih!`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    toast.info("File telah dihapus", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.warning("Pilih file terlebih dahulu!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!title.trim()) {
      toast.warning("Judul media harus diisi!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append(mediaType === "photo" ? "image" : "video", file);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token tidak ditemukan, silakan login kembali", {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Mengupload media...", {
        position: "top-right",
      });

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/gallery/add`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Upload sukses:", res.data);
      
      // Update loading toast to success
      toast.update(loadingToast, {
        render: " Media berhasil diupload!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
      });

      // Redirect setelah 2 detik
      setTimeout(() => {
        router.push("/gallery");
      }, 2000);

    } catch (err: any) {
      console.error("Error Upload:", err.response?.data || err.message);
      
      toast.error(`Gagal upload media: ${err.response?.data?.message || err.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        <div className="min-h-screen bg-gray-50 p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div className="flex-1">
              <button
                onClick={() => router.push("/gallery")}
                className="mb-4 inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                <FiArrowLeft className="mr-2" /> 
                Kembali ke Gallery
              </button>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">Tambah Media Baru</h1>
              <p className="text-gray-500">Unggah foto atau video untuk ditambahkan ke gallery</p>
            </div>
          </div>

          {/* Form Container */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Form Header */}
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-800">Upload Media</h2>
                <p className="text-gray-600 text-sm mt-1">Pilih jenis media dan isi informasi yang diperlukan</p>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Media Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Jenis Media
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setMediaType("photo");
                        setFile(null);
                        setPreview(null);
                        toast.info("Mode upload foto", {
                          position: "top-right",
                          autoClose: 2000,
                        });
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        mediaType === "photo"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <FiImage />
                      Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaType("video");
                        setFile(null);
                        setPreview(null);
                        toast.info("Mode upload video", {
                          position: "top-right",
                          autoClose: 2000,
                        });
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        mediaType === "video"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <FiVideo />
                      Video
                    </button>
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Media <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masukkan judul media yang menarik"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700"
                    required
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan deskripsi singkat tentang media ini"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-700 resize-none"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload {mediaType === "photo" ? "Foto" : "Video"} <span className="text-red-500">*</span>
                  </label>
                  
                  {!file ? (
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept={mediaType === "photo" ? "image/*" : "video/*"}
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                          <FiUpload className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">
                            Drag & drop file di sini
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            atau <span className="text-blue-600 font-medium">klik untuk memilih</span>
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">
                          {mediaType === "photo" 
                            ? "Format yang didukung: JPG, PNG, GIF (Maks. 10MB)"
                            : "Format yang didukung: MP4, MOV (Maks. 50MB)"
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            {mediaType === "photo" ? (
                              <FiImage className="w-5 h-5 text-blue-600" />
                            ) : (
                              <FiVideo className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Section */}
                {preview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preview
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {mediaType === "photo" ? (
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full rounded-lg shadow-md object-cover max-h-64"
                        />
                      ) : (
                        <video
                          controls
                          className="w-full rounded-lg shadow-md max-h-64"
                          src={preview}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !file}
                    className="w-full inline-flex justify-center items-center gap-2 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <FiUpload />
                        Simpan Media
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}