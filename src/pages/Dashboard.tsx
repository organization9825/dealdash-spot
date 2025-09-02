import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService, menuService } from '@/lib/api';
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
import { Plus, Edit2, Trash2, Store, Menu as MenuIcon, Percent } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: ''
  });
  const { toast } = useToast();

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      // For demo purposes, using mock data
      // In real app: const data = await menuService.getVendorMenu();
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
        }
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Shop Profile</CardTitle>
                <CardDescription>
                  Update your shop information and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Shop profile management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;