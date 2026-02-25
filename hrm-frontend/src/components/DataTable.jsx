/**
 * ============================================================
 * DATA TABLE COMPONENT - HRM Frontend
 * ============================================================
 * Component bảng dữ liệu với phân trang, tìm kiếm, sorting
 * ============================================================
 */

import { useState, useMemo } from 'react'; ``
import './DataTable.css';

const DataTable = ({
    columns,
    data,
    loading = false,
    totalItems = 0,
    pageSize = 10,
    currentPage = 1,
    onPageChange,
    onSearch,
    onSort,
    sortable = true,
    searchable = true,
    actions = null,
    emptyMessage = 'Không có dữ liệu',
    rowKey = 'id',
    selectable = false,
    selectedIds = [],
    onSelectionChange = null,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Xử lý chọn một dòng
    const handleSelectRow = (rowId) => {
        if (!onSelectionChange) return;

        const newSelectedIds = selectedIds.includes(rowId)
            ? selectedIds.filter(id => id !== rowId)
            : [...selectedIds, rowId];
        console.log('Selected IDs:', newSelectedIds);
        onSelectionChange(newSelectedIds);
    };

    // Xử lý chọn tất cả các dòng trên trang hiện tại
    const handleSelectAll = () => {
        if (!onSelectionChange || !data.length) return;

        const currentPageIds = data.map(row => row[rowKey]).filter(Boolean);
        const allSelected = currentPageIds.every(id => selectedIds.includes(id));

        let newSelectedIds;
        if (allSelected) {
            // Bỏ chọn tất cả các dòng trên trang hiện tại
            newSelectedIds = selectedIds.filter(id => !currentPageIds.includes(id));
        } else {
            // Chọn tất cả các dòng trên trang hiện tại
            const uniqueIds = new Set([...selectedIds, ...currentPageIds]);
            newSelectedIds = Array.from(uniqueIds);
        }

        onSelectionChange(newSelectedIds);
    };

    // Kiểm tra xem tất cả các dòng trên trang hiện tại có được chọn không
    const isAllSelected = data.length > 0 && data.every(row => selectedIds.includes(row[rowKey]));
    const isIndeterminate = data.some(row => selectedIds.includes(row[rowKey])) && !isAllSelected;

    // Xử lý tìm kiếm
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    // Xử lý sort
    const handleSort = (key) => {
        if (!sortable || !onSort) return;

        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        onSort(key, direction);
    };

    // Tính toán phân trang
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // Render pagination buttons
    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page
        if (startPage > 1) {
            pages.push(
                <button key="1" className="page-btn" onClick={() => onPageChange(1)}>1</button>
            );
            if (startPage > 2) {
                pages.push(<span key="ellipsis1" className="page-ellipsis">...</span>);
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`page-btn ${i === currentPage ? 'active' : ''}`}
                    onClick={() => onPageChange(i)}
                >
                    {i}
                </button>
            );
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="ellipsis2" className="page-ellipsis">...</span>);
            }
            pages.push(
                <button
                    key={totalPages}
                    className="page-btn"
                    onClick={() => onPageChange(totalPages)}
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="data-table-container">
            {/* Toolbar */}
            <div className="table-toolbar">
                {searchable && (
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button
                                className="clear-search"
                                onClick={() => { setSearchTerm(''); onSearch && onSearch(''); }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}
                {selectable && selectedIds.length > 0 && (
                    <div className="selection-info">
                        <span className="selection-count">Đã chọn {selectedIds.length} bản ghi</span>
                    </div>
                )}
                {actions && <div className="table-actions">{actions}</div>}
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            {selectable && (
                                <th className="checkbox-column">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = isIndeterminate;
                                        }}
                                        onChange={handleSelectAll}
                                        className="select-all-checkbox"
                                    />
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`${column.className || ''} ${sortable && column.sortable !== false ? 'sortable' : ''}`}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable !== false && handleSort(column.key)}
                                >
                                    <div className="th-content">
                                        <span>{column.title}</span>
                                        {sortable && column.sortable !== false && (
                                            <span className="sort-icon">
                                                {sortConfig.key === column.key
                                                    ? sortConfig.direction === 'asc'
                                                        ? '▲'
                                                        : '▼'
                                                    : '⇅'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={selectable ? columns.length + 1 : columns.length} className="loading-cell">
                                    <div className="table-loading">
                                        <div className="spinner"></div>
                                        <p>Đang tải dữ liệu...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={selectable ? columns.length + 1 : columns.length} className="empty-cell">
                                    <div className="empty-state">
                                        <span className="empty-icon">📭</span>
                                        <p>{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => (
                                <tr
                                    key={row[rowKey] || index}
                                    className={`table-row ${selectedIds.includes(row[rowKey]) ? 'selected' : ''}`}
                                >
                                    {selectable && (
                                        <td className="checkbox-column">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(row[rowKey])}
                                                onChange={() => handleSelectRow(row[rowKey])}
                                                className="row-checkbox"
                                            />
                                        </td>
                                    )}
                                    {columns.map((column) => (
                                        <td key={column.key} className={column.className || ''}>
                                            {column.render
                                                ? column.render(row[column.key], row, index)
                                                : row[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="table-pagination">
                    <div className="pagination-info">
                        Hiển thị <strong>{startItem}-{endItem}</strong> của <strong>{totalItems}</strong> bản ghi
                    </div>
                    <div className="pagination-controls">
                        <button
                            className="page-btn nav"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ◀ Trước
                        </button>
                        {renderPagination()}
                        <button
                            className="page-btn nav"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Sau ▶
                        </button>
                    </div>
                    <div className="page-size-selector">
                        <select
                            value={pageSize}
                            onChange={(e) => onPageChange(1, parseInt(e.target.value))}
                        >
                            <option value={10}>10 / trang</option>
                            <option value={25}>25 / trang</option>
                            <option value={50}>50 / trang</option>
                            <option value={100}>100 / trang</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;