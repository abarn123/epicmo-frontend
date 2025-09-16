"use client";
import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { Bar, Pie, Line, } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


// Data dan options chart
const BarData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [
    {
      label: 'Contoh Data',
      data: [12, 19, 10, 5],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: { position: "top" as const },
    title: { display: true, text: 'Contoh Chart' },
  },
};



const MediaDashboard = () => {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* untuk memanggil chart.js */}
            <Bar data={BarData} options={options} />
            
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
};


export default MediaDashboard;
