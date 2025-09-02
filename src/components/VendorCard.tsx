import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Percent } from 'lucide-react';

interface VendorCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  location?: string;
  rating?: number;
  offers?: string;
  distance?: number;
}

const VendorCard = ({ 
  id, 
  name, 
  description, 
  category, 
  image, 
  location, 
  rating, 
  offers,
  distance 
}: VendorCardProps) => {
  return (
    <Link to={`/shop/${id}`}>
      <Card className="bg-vendor-card hover:bg-vendor-hover hover:shadow-hover transition-all duration-300 cursor-pointer group overflow-hidden">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-hero overflow-hidden">
          {image ? (
            <img 
              src={image} 
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-hero flex items-center justify-center">
              <div className="text-4xl font-bold text-primary opacity-50">
                {name.charAt(0)}
              </div>
            </div>
          )}
          
          {/* Offers Badge */}
          {offers && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-deal-secondary text-white font-semibold">
                <Percent className="h-3 w-3 mr-1" />
                {offers}
              </Badge>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="font-medium">
              {category}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>

          {/* Details Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {location && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{location}</span>
                  {distance && <span>• {distance}km</span>}
                </div>
              )}
            </div>
            
            {rating && (
              <div className="flex items-center gap-1 text-deal-secondary">
                <Star className="h-3 w-3 fill-current" />
                <span className="font-medium">{rating}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default VendorCard;