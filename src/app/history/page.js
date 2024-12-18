"use client";

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';

export default function HistoryPage() {
    const [profiles, setProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        Ear: false,
        Nose: false,
        Throat: false,
    });
    const router = useRouter();

    const fetchProfiles = async () => {
        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            const response = await fetch('/api/history', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.profiles) {
                setProfiles(data.profiles);
                setFilteredProfiles(data.profiles);
            } else {
                setProfiles([]);
                setFilteredProfiles([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profiles:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    useEffect(() => {
        filterProfiles();
    }, [searchTerm, filters, profiles]);

    const handleProfileClick = (profileId) => {
        router.push(`/profile/${profileId}`);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (filter) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filter]: !prevFilters[filter],
        }));
    };

    const filterProfiles = () => {
        const filtered = profiles.filter((profile) => {
            const matchesSearch = profile.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
            const matchesFilters = Object.keys(filters).some(
                (key) => filters[key] && profile.category?.includes(key)
            );
    
            return matchesSearch && (matchesFilters || !Object.values(filters).some((val) => val));
        });
    
        setFilteredProfiles(filtered);
    };

    return (
        <div className="min-h-screen p-4 mt-20">
            <div className="grid grid-cols-10 gap-4 max-w-screen-lg mx-auto">
                <div className="col-span-3 bg-gray-100 p-4 rounded-lg border border-gray-300">
                    <h3 className="text-lg font-semibold mb-4">Filters</h3>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <div className="flex flex-col space-y-2">
                        {Object.keys(filters).map((filter) => (
                            <label key={filter} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={filters[filter]}
                                    onChange={() => handleFilterChange(filter)}
                                />
                                <span>{filter}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="col-span-7 bg-gray-50 p-4 rounded-lg border border-gray-300">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Spin size="large" />
                        </div>
                    ) : filteredProfiles.length > 0 ? (
                        <ul className="space-y-4">
                            {filteredProfiles.map((profile) => (
                                <li 
                                    key={profile._id} 
                                    className="bg-white p-4 rounded-lg shadow border border-gray-200 cursor-pointer hover:bg-gray-100 transition" 
                                    onClick={() => handleProfileClick(profile._id)}
                                >
                                    <div className="mb-2 text-gray-500">
                                        Created on: {new Date(profile.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex space-x-4">
                                        {profile.images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image.path}
                                                alt={`image-${index}`}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No profiles found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
