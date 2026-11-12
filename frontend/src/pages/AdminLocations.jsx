
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminLocations.css";

function AdminLocations() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [locations, setLocations] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [locationForm, setLocationForm] = useState({
    locationName: "",
    address: "",
    city: "",
    description: ""
  });

  const [zoneForm, setZoneForm] = useState({
    zoneName: "",
    zoneCode: "",
    location: "",
    description: ""
  });

  const [editingLocation, setEditingLocation] = useState(null);
  const [editingZone, setEditingZone] = useState(null);

  useEffect(() => {
    if (user.role?.toLowerCase() !== "admin") {
      setError("Access denied. Admin only.");
      setLoading(false);
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [locationResponse, zoneResponse] = await Promise.all([
        api.get("/locations/locations"),
        api.get("/locations/zones")
      ]);
      setLocations(locationResponse.data.locations || []);
      setZones(zoneResponse.data.zones || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load locations and zones.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingLocation) {
        await api.put(`/locations/locations/${editingLocation}`, locationForm);
        setMessage("Parking location updated successfully.");
      } else {
        await api.post("/locations/locations", locationForm);
        setMessage("Parking location added successfully.");
      }

      setLocationForm({
        locationName: "",
        address: "",
        city: "",
        description: ""
      });
      setEditingLocation(null);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save location.");
    }
  };

  const handleZoneSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingZone) {
        await api.put(`/locations/zones/${editingZone}`, zoneForm);
        setMessage("Zone updated successfully.");
      } else {
        await api.post("/locations/zones", zoneForm);
        setMessage("Zone added successfully.");
      }

      setZoneForm({
        zoneName: "",
        zoneCode: "",
        location: "",
        description: ""
      });
      setEditingZone(null);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save zone.");
    }
  };

  const editLocation = (location) => {
    setEditingLocation(location._id);
    setLocationForm({
      locationName: location.locationName,
      address: location.address,
      city: location.city,
      description: location.description || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editZone = (zone) => {
    setEditingZone(zone._id);
    setZoneForm({
      zoneName: zone.zoneName,
      zoneCode: zone.zoneCode,
      location: zone.location?._id || zone.location,
      description: zone.description || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeLocation = async (id) => {
    if (!window.confirm("Delete this location and all its zones?")) return;

    try {
      await api.delete(`/locations/locations/${id}`);
      setMessage("Location and its zones deleted successfully.");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete location.");
    }
  };

  const removeZone = async (id) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) return;

    try {
      await api.delete(`/locations/zones/${id}`);
      setMessage("Zone deleted successfully.");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete zone.");
    }
  };

  if (loading) return <div className="locations-page">Loading locations...</div>;

  if (user.role?.toLowerCase() !== "admin") {
    return <div className="locations-page">Access Denied</div>;
  }

  return (
    <div className="locations-page">
      <div className="locations-header">
        <div>
          <p className="locations-label">PARKING MANAGEMENT</p>
          <h1>Parking Locations & Zones</h1>
          <p>Manage your parking facilities and organize them into zones.</p>
        </div>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>

      {message && <div className="location-success">{message}</div>}
      {error && <div className="location-error">{error}</div>}

      <div className="location-stats">
        <div><span>Total Locations</span><h2>{locations.length}</h2></div>
        <div><span>Total Zones</span><h2>{zones.length}</h2></div>
        <div><span>Active Locations</span><h2>{locations.filter(item => item.isActive).length}</h2></div>
      </div>

      <div className="location-forms">
        <section className="location-panel">
          <h2>{editingLocation ? "Edit Parking Location" : "Add Parking Location"}</h2>
          <form onSubmit={handleLocationSubmit}>
            <label>Location Name</label>
            <input
              required
              value={locationForm.locationName}
              onChange={e => setLocationForm({ ...locationForm, locationName: e.target.value })}
              placeholder="Example: City Centre Parking"
            />

            <label>Address</label>
            <input
              required
              value={locationForm.address}
              onChange={e => setLocationForm({ ...locationForm, address: e.target.value })}
              placeholder="Enter full address"
            />

            <label>City</label>
            <input
              required
              value={locationForm.city}
              onChange={e => setLocationForm({ ...locationForm, city: e.target.value })}
              placeholder="Enter city"
            />

            <label>Description</label>
            <textarea
              value={locationForm.description}
              onChange={e => setLocationForm({ ...locationForm, description: e.target.value })}
              placeholder="Optional description"
            />

            <button type="submit">{editingLocation ? "Update Location" : "Add Location"}</button>
            {editingLocation && (
              <button type="button" className="cancel-button" onClick={() => {
                setEditingLocation(null);
                setLocationForm({ locationName: "", address: "", city: "", description: "" });
              }}>Cancel Edit</button>
            )}
          </form>
        </section>

        <section className="location-panel">
          <h2>{editingZone ? "Edit Zone" : "Add Zone"}</h2>
          <form onSubmit={handleZoneSubmit}>
            <label>Zone Name</label>
            <input
              required
              value={zoneForm.zoneName}
              onChange={e => setZoneForm({ ...zoneForm, zoneName: e.target.value })}
              placeholder="Example: Ground Floor"
            />

            <label>Zone Code</label>
            <input
              required
              value={zoneForm.zoneCode}
              onChange={e => setZoneForm({ ...zoneForm, zoneCode: e.target.value })}
              placeholder="Example: A"
            />

            <label>Parking Location</label>
            <select
              required
              value={zoneForm.location}
              onChange={e => setZoneForm({ ...zoneForm, location: e.target.value })}
            >
              <option value="">Select a location</option>
              {locations.map(location => (
                <option key={location._id} value={location._id}>
                  {location.locationName}
                </option>
              ))}
            </select>

            <label>Description</label>
            <textarea
              value={zoneForm.description}
              onChange={e => setZoneForm({ ...zoneForm, description: e.target.value })}
              placeholder="Optional description"
            />

            <button type="submit" disabled={locations.length === 0}>
              {editingZone ? "Update Zone" : "Add Zone"}
            </button>
            {editingZone && (
              <button type="button" className="cancel-button" onClick={() => {
                setEditingZone(null);
                setZoneForm({ zoneName: "", zoneCode: "", location: "", description: "" });
              }}>Cancel Edit</button>
            )}
            {locations.length === 0 && <p>Add a location before creating a zone.</p>}
          </form>
        </section>
      </div>

      <section className="location-panel location-list">
        <h2>Parking Locations</h2>
        <div className="location-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Address</th>
                <th>City</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.length === 0 ? (
                <tr><td colSpan="5">No parking locations added yet.</td></tr>
              ) : locations.map(location => (
                <tr key={location._id}>
                  <td>{location.locationName}</td>
                  <td>{location.address}</td>
                  <td>{location.city}</td>
                  <td>{location.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <button className="edit-button" onClick={() => editLocation(location)}>Edit</button>
                    <button className="delete-button" onClick={() => removeLocation(location._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="location-panel location-list">
        <h2>Parking Zones</h2>
        <div className="location-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Zone Name</th>
                <th>Zone Code</th>
                <th>Parking Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.length === 0 ? (
                <tr><td colSpan="5">No zones added yet.</td></tr>
              ) : zones.map(zone => (
                <tr key={zone._id}>
                  <td>{zone.zoneName}</td>
                  <td>{zone.zoneCode}</td>
                  <td>{zone.location?.locationName || "Location unavailable"}</td>
                  <td>{zone.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <button className="edit-button" onClick={() => editZone(zone)}>Edit</button>
                    <button className="delete-button" onClick={() => removeZone(zone._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminLocations;
