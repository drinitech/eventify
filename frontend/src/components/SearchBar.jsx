const CATEGORIES = ['koncert', 'konference', 'social', 'workshop', 'sport', 'tjeter'];

export function SearchBar({ filters, onChange }) {
  function update(field) {
    return (e) => {
      const value = e.target.value;
      onChange({ ...filters, [field]: value || undefined, page: 1 });
    };
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <input
        type="text"
        placeholder="Kerko evente..."
        value={filters.q || ''}
        onChange={update('q')}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm lg:col-span-2"
      />
      <select
        value={filters.category || ''}
        onChange={update('category')}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">Te gjitha kategorite</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        type="number"
        min="0"
        placeholder="Cmimi min"
        value={filters.minPrice || ''}
        onChange={update('minPrice')}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      />
      <input
        type="number"
        min="0"
        placeholder="Cmimi max"
        value={filters.maxPrice || ''}
        onChange={update('maxPrice')}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      />
    </div>
  );
}
