'use client';
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FreelancerCard } from '@/components/freelancer-card';
import { freelancers, Freelancer } from '@/lib/mock-data';
import { Search } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('');

  const filteredFreelancers = useMemo(() => {
    return freelancers.filter((freelancer) => {
      const matchesSearch =
        freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        freelancer.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        freelancer.skills.some((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        category === 'all' || freelancer.category === category;
      const matchesLocation =
        location === '' ||
        freelancer.location.toLowerCase().includes(location.toLowerCase());
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [searchQuery, category, location]);

  const uniqueCategories = [
    'all',
    ...Array.from(new Set(freelancers.map((f) => f.category))),
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl font-headline">
          Find the Perfect Freelance Talent
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Browse our curated list of professional freelancers to find the perfect fit for your project.
        </p>
      </div>

      <div className="sticky top-[73px] z-10 mb-8 p-4 bg-background/80 backdrop-blur-lg rounded-xl border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {uniqueCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Filter by location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFreelancers.map((freelancer) => (
          <FreelancerCard key={freelancer.id} freelancer={freelancer} />
        ))}
      </div>
       {filteredFreelancers.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-muted-foreground text-lg">No freelancers match your criteria.</p>
          </div>
        )}
    </div>
  );
}
