import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService, menuService, vendorService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Store, Menu as MenuIcon, Percent, Save, Loader2 } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  category?: string;
}

const Dashboard = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [vendorId, setVendorId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: ''
  });
  
  // Vendor profile state
  const [vendorProfile, setVendorProfile] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    phone: '',
    email: '',
    website: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const { toast } = useToast();

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      const vendor = await authService.getCurrentVendor();
      setVendorId(vendor.id);
      await Promise.all([
        fetchMenuItems(vendor.id),
        fetchVendorProfile(vendor.id)
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const fetchMenuItems = async (id: string) => {
    try {
      const data = await menuService.getVendorMenu(id);
      setMenuItems(data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorProfile = async (id: string) => {
    try {
      const data = await vendorService.getById(id);
      setVendorProfile({
        name: data.name || '',
        description: data.description || '',
        category: data.category || '',
        location: data.location || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || ''
      });
    } catch (error) {
      console.error('Failed to fetch vendor profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendor profile",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const menuItem = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discount: formData.discount ? parseFloat(formData.discount) : undefined,
        category: formData.category
      };

      if (editingItem) {
        // Update existing item
        const updatedItems = menuItems.map(item => 
          item.id === editingItem.id 
            ? { ...menuItem, id: editingItem.id }
            : item
        );
        setMenuItems(updatedItems);
        setEditingItem(null);
        toast({
          title: "Success",
          description: "Menu item updated successfully",
        });
      } else {
        // Add new item
        const newItem = { ...menuItem, id: Date.now().toString() };
        setMenuItems([...menuItems, newItem]);
        toast({
          title: "Success",
          description: "Menu item added successfully",
        });
      }

      resetForm();
      setIsAddingItem(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      discount: item.discount?.toString() || '',
      category: item.category || ''
    });
    setIsAddingItem(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setMenuItems(menuItems.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount: '',
      category: ''
    });
    setEditingItem(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVendorProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      await vendorService.update(vendorId, vendorProfile);
      toast({
        title: "Profile Updated",
        description: "Your vendor profile has been updated successfully.",
      });
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage your shop and menu items</p>
        </div>

        <Tabs defaultValue="menu" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <MenuIcon className="h-4 w-4" />
              Menu Management
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Shop Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-6">
            {/* Menu Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Menu Items</h2>
                <p className="text-muted-foreground">Manage your products and deals</p>
              </div>
              
              <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingItem ? 'Update your menu item details' : 'Add a new item to your menu'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Item Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Special Burger"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe your item..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($) *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          placeholder="12.99"
                          value={formData.price}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="discount">Discount (%)</Label>
                        <Input
                          id="discount"
                          name="discount"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="20"
                          value={formData.discount}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        name="category"
                        placeholder="e.g., Main Course, Appetizer"
                        value={formData.category}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingItem ? 'Update Item' : 'Add Item'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsAddingItem(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Menu Items Grid */}
            {loading ? (
              <div className="text-center py-8">Loading menu items...</div>
            ) : menuItems.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MenuIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No menu items yet</h3>
                  <p className="text-muted-foreground mb-4">Start by adding your first menu item</p>
                  <Button onClick={() => setIsAddingItem(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {menuItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            {item.discount && item.discount > 0 && (
                              <Badge className="bg-deal-secondary text-white">
                                <Percent className="h-3 w-3 mr-1" />
                                {item.discount}% OFF
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-muted-foreground mb-2">{item.description}</p>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-lg font-bold">
                              ${item.price.toFixed(2)}
                            </div>
                            {item.category && (
                              <Badge variant="outline">{item.category}</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Shop Profile
                  </div>
                  <Button
                    variant={isEditingProfile ? "outline" : "default"}
                    size="sm"
                    onClick={() => {
                       if (isEditingProfile) {
                         setIsEditingProfile(false);
                         fetchVendorProfile(vendorId); // Reset to original data
                       } else {
                        setIsEditingProfile(true);
                      }
                    }}
                  >
                    {isEditingProfile ? "Cancel" : "Edit Profile"}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage your shop information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="vendor-name">Shop Name</Label>
                    <Input
                      id="vendor-name"
                      name="name"
                      value={vendorProfile.name}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={!isEditingProfile ? "bg-muted" : ""}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendor-category">Category</Label>
                    <Input
                      id="vendor-category"
                      name="category"
                      value={vendorProfile.category}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={!isEditingProfile ? "bg-muted" : ""}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendor-phone">Phone</Label>
                    <Input
                      id="vendor-phone"
                      name="phone"
                      value={vendorProfile.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={!isEditingProfile ? "bg-muted" : ""}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendor-email">Email</Label>
                    <Input
                      id="vendor-email"
                      name="email"
                      type="email"
                      value={vendorProfile.email}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={!isEditingProfile ? "bg-muted" : ""}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendor-website">Website</Label>
                    <Input
                      id="vendor-website"
                      name="website"
                      value={vendorProfile.website}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={!isEditingProfile ? "bg-muted" : ""}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vendor-location">Location</Label>
                    <Input
                      id="vendor-location"
                      name="location"
                      value={vendorProfile.location}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className={!isEditingProfile ? "bg-muted" : ""}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vendor-description">Description</Label>
                  <Textarea
                    id="vendor-description"
                    name="description"
                    value={vendorProfile.description}
                    onChange={handleProfileChange}
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? "bg-muted" : ""}
                    rows={4}
                  />
                </div>
                
                {isEditingProfile && (
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={profileLoading}
                      className="flex items-center gap-2"
                    >
                      {profileLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;