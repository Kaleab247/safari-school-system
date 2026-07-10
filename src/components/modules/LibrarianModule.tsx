import React from 'react';
import { Library, BookOpen } from 'lucide-react';

interface LibrarianModuleProps {
  userName: string;
  books: any[];
  borrowRecords: any[];
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function LibrarianModule({
  userName,
  books,
  borrowRecords,
  showNotification
}: LibrarianModuleProps) {
  const totalAvailable = books.reduce((sum: number, b: any) => sum + b.available, 0);
  const totalBorrowed = borrowRecords.filter((b: any) => b.status === 'Borrowed').length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">Library Dashboard</h2>
        <p className="text-teal-200 mt-1">Welcome back, {userName}</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="bg-white/10 px-4 py-2 rounded-xl">
            <p className="text-sm text-teal-200">Total Books</p>
            <p className="font-bold">{books.length}</p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl">
            <p className="text-sm text-teal-200">Available</p>
            <p className="font-bold text-emerald-300">{totalAvailable}</p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl">
            <p className="text-sm text-teal-200">Borrowed</p>
            <p className="font-bold text-yellow-300">{totalBorrowed}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Library className="h-4 w-4" /> Book Catalog
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Author</th>
                <th className="px-4 py-2 text-center">Available</th>
                <th className="px-4 py-2 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {books.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No books in catalog yet.
                  </td>
                </tr>
              ) : (
                books.map((book: any) => (
                  <tr key={book.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{book.title}</td>
                    <td className="px-4 py-3">{book.author}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600">{book.available}</td>
                    <td className="px-4 py-3 text-center">{book.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}