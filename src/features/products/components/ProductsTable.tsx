'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import ProductForm from './ProductForm';
import { useProducts } from '../hooks/useProducts';
import {
  createProduct as createProductThunk,
  updateProduct as updateProductThunk,
  deleteProduct as deleteProductThunk,
} from '../store/productsThunks';
import type { Product, ProductCategory } from '@/types';

const CATEGORIES: ProductCategory[] = ['electronics', 'clothing', 'food', 'home', 'beauty'];

export default function ProductsTable() {
  const {
    products,
    pagination,
    filters,
    listStatus,
    createStatus,
    updateStatus,
    deleteStatus,
    setFilters,
    createProduct,
    updateProduct,
    deleteProduct,
    clearMutationStatus,
  } = useProducts();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const isLoading = listStatus === 'loading';

  function handlePaginationChange(model: GridPaginationModel) {
    setFilters({ page: model.page + 1, limit: model.pageSize });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setFilters({ search: searchInput });
  }

  function handleCategoryChange(value: string | null) {
    if (!value) return;
    setFilters({ category: value === 'all' ? undefined : (value as ProductCategory) });
  }

  function handleDelete(id: string, name: string) {
    toast.custom((toastId) => (
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 w-80 space-y-3">
        <p className="text-sm font-medium">Deactivate &ldquo;{name}&rdquo;?</p>
        <p className="text-xs text-muted-foreground">This will set the product as inactive.</p>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(toastId)}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              toast.dismiss(toastId);
              const result = await deleteProduct(id);
              if (deleteProductThunk.fulfilled.match(result as never)) {
                toast.success(`"${name}" deactivated`);
              } else {
                toast.error('Failed to deactivate product');
              }
            }}
          >
            Deactivate
          </Button>
        </div>
      </div>
    ), { duration: Infinity });
  }

  async function handleFormSubmit(formData: FormData) {
    if (editTarget) {
      const result = await updateProduct(editTarget._id, formData);
      if (updateProductThunk.fulfilled.match(result as never)) {
        toast.success('Product updated');
        setFormOpen(false);
        setEditTarget(null);
        clearMutationStatus();
      } else {
        toast.error('Update failed');
      }
    } else {
      const result = await createProduct(formData);
      if (createProductThunk.fulfilled.match(result as never)) {
        toast.success('Product created');
        setFormOpen(false);
        clearMutationStatus();
      } else {
        toast.error('Create failed');
      }
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'images',
      headerName: 'Image',
      width: 72,
      sortable: false,
      renderCell: (params) => {
        const src = (params.value as string[])?.[0];
        return src ? (
          <Image src={src} alt="product" width={40} height={40} className="rounded object-cover h-10 w-10" />
        ) : (
          <div className="h-10 w-10 rounded bg-muted" />
        );
      },
    },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: (params) => (
        <Badge variant="secondary" className="capitalize">{params.value as string}</Badge>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 100,
      renderCell: (params) => `$${(params.value as number).toFixed(2)}`,
    },
    { field: 'stock', headerName: 'Stock', width: 80, type: 'number' },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <Badge className="bg-green-100 text-green-700">Active</Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          <Link
            href={`/products/${(params.row as Product)._id}`}
            className={buttonVariants({ size: 'sm', variant: 'secondary' })}
          >
            View
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setEditTarget(params.row as Product); setFormOpen(true); }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete((params.row as Product)._id, (params.row as Product).name)}
          >
            Del
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading && products.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-52"
          />
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>

        <Select onValueChange={handleCategoryChange} defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            + New Product
          </Button>
        </div>
      </div>

      {/* DataGrid */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <DataGrid
          rows={products}
          columns={columns}
          getRowId={(row: Product) => row._id}
          rowCount={pagination?.totalProducts ?? products.length}
          paginationMode="server"
          paginationModel={{
            page: (filters.page ?? 1) - 1,
            pageSize: filters.limit ?? 10,
          }}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[10, 25, 50]}
          loading={isLoading}
          disableRowSelectionOnClick
          autoHeight
          sx={{ border: 'none' }}
        />
      </div>

      <ProductForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); clearMutationStatus(); }}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
        isSubmitting={createStatus === 'loading' || updateStatus === 'loading'}
      />
    </div>
  );
}

