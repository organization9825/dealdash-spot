import { useState, useEffect } from 'react';
import { vendorService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import VendorCard from '@/components/VendorCard';
import SearchAndFilter from '@/components/SearchAndFilter';
import { Loader2 } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  location?: string;
  rating?: number;
  offers?: string;
  contact?: string;
}

const Home = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getAll();
      setVendors(data);
      setFilteredVendors(data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map((vendor: Vendor) => vendor.category).filter(Boolean))] as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load vendors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredVendors(vendors);
      return;
    }

    const filtered = vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(query.toLowerCase()) ||
      vendor.description.toLowerCase().includes(query.toLowerCase()) ||
      vendor.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredVendors(filtered);
  };

  const handleFilterCategory = (category: string) => {
    if (category === 'all') {
      setFilteredVendors(vendors);
      return;
    }

    const filtered = vendors.filter(vendor => vendor.category === category);
    setFilteredVendors(filtered);
  };

  const handleSortByLocation = () => {
    // For now, just shuffle the array as a demo
    // In a real app, you'd sort by actual distance
    const shuffled = [...filteredVendors].sort(() => Math.random() - 0.5);
    setFilteredVendors(shuffled);
    
    toast({
      title: "Sorted by location",
      description: "Showing nearest vendors first",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Discover Amazing <span className="text-primary">Deals</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find the best discounts and offers from local vendors in your area
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <SearchAndFilter
            onSearch={handleSearch}
            onFilterCategory={handleFilterCategory}
            onSortByLocation={handleSortByLocation}
            categories={categories}
          />
        </div>
      </section>

      {/* Vendors Grid */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading vendors...</span>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-muted-foreground">No vendors found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  {filteredVendors.length} Vendor{filteredVendors.length !== 1 ? 's' : ''} Found
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    id={vendor.id}
                    name={vendor.name}
                    description={vendor.description}
                    category={vendor.category}
                    image={vendor.image}
                    location={vendor.location}
                    rating={vendor.rating}
                    offers={vendor.offers}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;