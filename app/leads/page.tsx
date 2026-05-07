import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function LeadsDashboard() {
  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
          Error loading leads. Please check your database connection.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leads Dashboard</h1>
          <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
            Total: {leads?.length || 0}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Company</th>
                  <th className="p-4 font-medium">Source</th>
                  <th className="p-4 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {leads?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No leads have been submitted yet.
                    </td>
                  </tr>
                ) : (
                  leads?.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{lead.full_name}</td>
                      <td className="p-4 text-gray-600">{lead.email}</td>
                      <td className="p-4 text-gray-600">{lead.company || <span className="text-gray-400 italic">None provided</span>}</td>
                      <td className="p-4 text-gray-600">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-blue-100">
                          {lead.source}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(lead.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}