import { notFound } from 'next/navigation';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface DataItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

async function getData(id: string): Promise<DataItem | null> {
  // Implementasi fetch data dari API
  // Contoh dummy data
  if (id === '1') {
    return {
      id: '1',
      title: 'Proyek Website Perusahaan',
      description: 'Pembangunan website perusahaan dengan fitur e-commerce dan blog',
      category: 'Web Development',
      status: 'active',
      createdAt: '2023-05-15'
    };
  }
  return null;
}

export default async function EditPage({ params }: { params: { id: string } }) {
  const data = await getData(params.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Kembali ke Daftar
          </Link>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edit Item</h1>
              <p className="text-gray-600">ID: {data.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                data.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {data.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </span>
              <span className="text-sm text-gray-500">
                Dibuat: {new Date(data.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Form Edit */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <form>
              <div className="space-y-6">
                {/* Judul */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    defaultValue={data.title}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={data.description}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                {/* Kategori dan Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      defaultValue={data.category}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          defaultChecked={data.status === 'active'}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">Aktif</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          defaultChecked={data.status === 'inactive'}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">Nonaktif</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <Link
                  href="/"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}