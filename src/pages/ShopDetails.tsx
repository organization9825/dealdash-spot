import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { vendorService, menuService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Star, Percent, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  category?: string;
  image?: string;
}

const ShopDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'price' | 'discount'>('price');
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchVendorData();
    }
  }, [id]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      // Fetch all vendors and find the one with matching ID
      const vendors = await vendorService.getAll();
      const vendorData = vendors.find((v: Vendor) => v.id === id);
      
      if (vendorData) {
        setVendor(vendorData);
        // In a real app, you'd fetch menu items specifically for this vendor
        // For now, we'll use mock data
        setMenuItems([
          {
            id: '1',
            name: 'Special Burger',
            description: 'Delicious burger with special sauce',
            price: 12.99,
            discount: 20,
            category: 'Main Course'
          },
          {
            id: '2',
            name: 'Pizza Margherita',
            description: 'Classic pizza with tomato sauce and mozzarella',
            price: 15.99,
            discount: 15,
            category: 'Pizza'
          },
          {
            id: '3',
            name: 'Caesar Salad',
            description: 'Fresh salad with parmesan and croutons',
            price: 8.99,
            discount: 0,
            category: 'Salads'
          }
        ]);
      } else {
        toast({
          title: "Vendor not found",
          description: "The shop you're looking for doesn't exist.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load shop details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sortedMenuItems = [...menuItems].sort((a, b) => {
    if (sortBy === 'price') {
      return a.price - b.price;
    } else {
      return (b.discount || 0) - (a.discount || 0);
    }
  });

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price - (price * discount / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-pulse">Loading shop details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Shop Not Found</h2>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Vendor Header */}
      <section className="bg-gradient-hero py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Vendor Image */}
            <div className="w-full md:w-64 h-64 bg-gradient-primary rounded-lg flex items-center justify-center">
              {vendor.image ? (
                <img 
                  src={vendor.image} 
                  alt={vendor.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-6xl font-bold text-white opacity-50">
                  {vendor.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Vendor Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{vendor.name}</h1>
                  <Badge className="mb-3">{vendor.category}</Badge>
                </div>
                {vendor.offers && (
                  <Badge className="bg-deal-secondary text-white">
                    <Percent className="h-3 w-3 mr-1" />
                    {vendor.offers}
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground text-lg">{vendor.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                {vendor.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.location}</span>
                  </div>
                )}
                
                {vendor.contact && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.contact}</span>
                  </div>
                )}
                
                {vendor.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-deal-secondary fill-current" />
                    <span className="font-medium">{vendor.rating}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Open Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Menu & Deals</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant={sortBy === 'price' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('price')}
                  >
                    Sort by Price
                  </Button>
                  <Button 
                    variant={sortBy === 'discount' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('discount')}
                  >
                    Sort by Discount
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-4">
                {sortedMenuItems.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex justify-between items-start p-4 hover:bg-muted/50 rounded-lg transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          {item.discount && item.discount > 0 && (
                            <Badge variant="destructive" className="bg-deal-secondary">
                              {item.discount}% OFF
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">{item.description}</p>
                        {item.category && (
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-right ml-4">
                        {item.discount && item.discount > 0 ? (
                          <div>
                            <div className="text-lg font-bold text-deal-secondary">
                              ${calculateDiscountedPrice(item.price, item.discount).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground line-through">
                              ${item.price.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-lg font-bold">
                            ${item.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    {index < sortedMenuItems.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ShopDetails;