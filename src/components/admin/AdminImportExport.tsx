import { useState } from 'react';
import { Download, Upload, FileText, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

type EntityType = 'products' | 'orders' | 'customers' | 'reviews';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function AdminImportExport() {
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('products');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const exportData = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true);
    try {
      let data: any[] = [];
      let filename = '';

      switch (selectedEntity) {
        case 'products':
          const { data: products } = await supabase
            .from('products')
            .select('*, categories(name)');
          data = products?.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            slug: p.slug,
            category: p.categories?.name || '',
            base_price: p.base_price,
            compare_at_price: p.compare_at_price,
            stock_quantity: p.stock_quantity,
            is_featured: p.is_featured,
            image_url: p.image_url,
          })) || [];
          filename = 'products';
          break;

        case 'orders':
          const { data: orders } = await supabase
            .from('orders')
            .select('*, customers(email), order_items(*)');
          data = orders?.map(o => ({
            order_number: o.order_number,
            customer_email: o.customers?.email || '',
            total_amount: o.total_amount,
            status: o.status,
            payment_status: o.payment_status,
            created_at: o.created_at,
            items_count: o.order_items?.length || 0,
          })) || [];
          filename = 'orders';
          break;

        case 'customers':
          const { data: customers } = await supabase
            .from('customers')
            .select('*');
          data = customers?.map(c => ({
            email: c.email,
            first_name: c.first_name,
            last_name: c.last_name,
            phone: c.phone,
            created_at: c.created_at,
          })) || [];
          filename = 'customers';
          break;

        case 'reviews':
          const { data: reviews } = await supabase
            .from('product_reviews')
            .select('*, products(name), customers(email)');
          data = reviews?.map(r => ({
            product: r.products?.name || '',
            customer_email: r.customers?.email || '',
            rating: r.rating,
            comment: r.comment,
            is_approved: r.is_approved,
            created_at: r.created_at,
          })) || [];
          filename = 'reviews';
          break;
      }

      if (format === 'csv') {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        downloadFile(blob, `${filename}.csv`);
      } else {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, selectedEntity);
        XLSX.writeFile(wb, `${filename}.xlsx`);
      }
    } catch (error) {
      alert('Export failed: ' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    let template: any[] = [];

    switch (selectedEntity) {
      case 'products':
        template = [{
          name: 'Example Product',
          description: 'Product description',
          slug: 'example-product',
          category_id: 'category-uuid-here',
          base_price: 29.99,
          compare_at_price: 39.99,
          stock_quantity: 100,
          is_featured: false,
          image_url: 'https://example.com/image.jpg',
        }];
        break;
      case 'customers':
        template = [{
          email: 'customer@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone: '+1234567890',
        }];
        break;
      default:
        alert('Templates only available for products and customers');
        return;
    }

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadFile(blob, `${selectedEntity}_template.csv`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const importData = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await importFile.text();
      let parsedData: any[] = [];

      if (importFile.name.endsWith('.csv')) {
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        parsedData = result.data;
      } else if (importFile.name.endsWith('.xlsx')) {
        const workbook = XLSX.read(text, { type: 'string' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        parsedData = XLSX.utils.sheet_to_json(firstSheet);
      } else {
        throw new Error('Unsupported file format');
      }

      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
      };

      if (selectedEntity === 'products') {
        for (const row of parsedData) {
          try {
            const { error } = await supabase.from('products').insert([{
              name: row.name,
              description: row.description,
              slug: row.slug || row.name?.toLowerCase().replace(/\s+/g, '-'),
              category_id: row.category_id,
              base_price: parseFloat(row.base_price),
              compare_at_price: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
              stock_quantity: parseInt(row.stock_quantity) || 0,
              is_featured: row.is_featured === 'true' || row.is_featured === true,
              image_url: row.image_url,
            }]);

            if (error) {
              result.failed++;
              result.errors.push(`Row ${result.success + result.failed}: ${error.message}`);
            } else {
              result.success++;
            }
          } catch (err) {
            result.failed++;
            result.errors.push(`Row ${result.success + result.failed}: ${(err as Error).message}`);
          }
        }
      } else if (selectedEntity === 'customers') {
        for (const row of parsedData) {
          try {
            const { error } = await supabase.from('customers').insert([{
              email: row.email,
              first_name: row.first_name,
              last_name: row.last_name,
              phone: row.phone,
            }]);

            if (error) {
              result.failed++;
              result.errors.push(`Row ${result.success + result.failed}: ${error.message}`);
            } else {
              result.success++;
            }
          } catch (err) {
            result.failed++;
            result.errors.push(`Row ${result.success + result.failed}: ${(err as Error).message}`);
          }
        }
      }

      setImportResult(result);
    } catch (error) {
      alert('Import failed: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Import & Export</h1>
      <p className="text-gray-600 mb-8">Bulk manage your data with CSV and Excel files</p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold">Export Data</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Data Type</label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value as EntityType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="products">Products</option>
                <option value="orders">Orders</option>
                <option value="customers">Customers</option>
                <option value="reviews">Reviews</option>
              </select>
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={() => exportData('csv')}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                <FileText className="w-5 h-5" />
                {isExporting ? 'Exporting...' : 'Export as CSV'}
              </button>

              <button
                onClick={() => exportData('xlsx')}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                <FileSpreadsheet className="w-5 h-5" />
                {isExporting ? 'Exporting...' : 'Export as Excel'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold">Import Data</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Data Type</label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value as EntityType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="products">Products</option>
                <option value="customers">Customers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {importFile && (
                <p className="text-sm text-gray-600 mt-2">Selected: {importFile.name}</p>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={importData}
                disabled={!importFile || isImporting}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
              >
                {isImporting ? 'Importing...' : 'Import Data'}
              </button>

              <button
                onClick={downloadTemplate}
                className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Download Template
              </button>
            </div>

            {importResult && (
              <div className={`mt-4 p-4 rounded-md ${
                importResult.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-start gap-2 mb-2">
                  {importResult.failed === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">Import Complete</p>
                    <p className="text-sm mt-1">
                      Successfully imported: {importResult.success}
                      {importResult.failed > 0 && ` | Failed: ${importResult.failed}`}
                    </p>
                  </div>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto">
                    <p className="text-sm font-medium mb-1">Errors:</p>
                    <ul className="text-sm space-y-1">
                      {importResult.errors.slice(0, 10).map((error, i) => (
                        <li key={i} className="text-red-600">• {error}</li>
                      ))}
                      {importResult.errors.length > 10 && (
                        <li className="text-gray-600">... and {importResult.errors.length - 10} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">Import Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Download a template to see the required format</li>
          <li>• CSV and Excel (.xlsx) files are supported</li>
          <li>• Products require a valid category_id (UUID)</li>
          <li>• Duplicate entries may be rejected by the database</li>
          <li>• Large imports may take several minutes to process</li>
          <li>• Always backup your data before importing</li>
        </ul>
      </div>
    </div>
  );
}
