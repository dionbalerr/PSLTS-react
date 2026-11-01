function Topbar({ search, onSearchChange })
{
  return (
    <header className="topbar">
      <label className="search-box">
        <span>⌕</span>
        <input
          aria-label="Search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search master data..."
          value={search}
        />
        <kbd>⌘ K</kbd>
      </label>
      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="Notifications">♧</button>
        <div className="avatar">DB</div>
      </div>
    </header>
  )
}

export default Topbar
