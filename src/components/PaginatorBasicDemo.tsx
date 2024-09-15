/* eslint-disable react-hooks/exhaustive-deps */

// React Imports
import { useState, useEffect, useRef, FormEvent, useMemo } from "react";

// Prime React Imports
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";
import { Paginator, PaginatorPageChangeEvent } from "primereact/paginator";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

// types import
import { DataColumn } from "../types/DataColumn";

export default function PaginatorBasicDemo() {
  // states
  const [currentRows, setRows] = useState<DataColumn[]>([]);
  const [selectedRows, setSelectedRows] = useState<DataColumn[]>([]);
  const [rowsperPage, setRowsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pgination, setPgination] = useState<number>(0);
  const [isSelected, setIsSelected] = useState(false);
  const [first, setFirst] = useState(0);
  const [inputValue, setInputValue] = useState(0);

  // helpers
  const updateSelectedRows = (sliceValue: number) => {
    const newSelectedRows = [...selectedRows, ...currentRows.slice(0, sliceValue)];
    setSelectedRows(newSelectedRows);
  };

  // effects
  useEffect(() => {
    setFirst(currentPage * (rowsperPage - 1));
  }, [rowsperPage, currentPage]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${currentPage}`
      );

      const { data, pagination } = await res.json();
      setPgination(pagination.total_pages);
      setRows(data);
    };

    fetchData();
  }, [currentPage]);

  useEffect(() => {
    if (isSelected) {
      updateSelectedRows(inputValue)
    }
  }, [currentRows, isSelected]);

  // refs
  const inputRef = useRef<HTMLInputElement>(null);
  const op = useRef<OverlayPanel>(null);

  // ******* ALL HANDLERS *******

  // page change handler
  const onPageChange = (event: PaginatorPageChangeEvent) => {
    setRowsPerPage(event.rows);
    setCurrentPage(event.page + 1);
    setInputValue(inputValue > rowsperPage ? inputValue - rowsperPage : 0);
  };

  // submit number of rows selected handler
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = parseInt(inputRef.current?.value || "0");
    updateSelectedRows(value);

    if (value > rowsperPage) {
      setIsSelected(true);
    } else {
      setIsSelected(false);
    }
    setInputValue(value);
    op.current?.hide(); // hide form after sumbitt
  };

  // rows per page change handler
  const onRowsPerPageChange = (event: DropdownChangeEvent) => {
    const newRowsPerPage: number = parseInt(event.target.value, 10); // Convert the value to a number

    // Calculate new 'first' based on the current page and new rowsPerPage
    const newFirst: number = Math.floor(first / rowsperPage) * newRowsPerPage;

    setRowsPerPage(newRowsPerPage);
    setFirst(newFirst); // Keep the current page's position based on the new rows per page
  };

  

  // custom header
  const renderHeader = () => {
    return (
      <>
        <div className="custom-header">
          <button onClick={(e) => op.current?.toggle(e)}>
            {/* Caret Down icon */}
            <i className="pi pi-angle-down" style={{ color: "#708090" }}></i>
          </button>
          Title
        </div>
        <OverlayPanel ref={op}>
          <form onSubmit={onSubmit}>
            <InputText
              ref={inputRef}
              type="text"
              className="p-inputtext-sm"
              placeholder="Selected Rows"
            />
            <button type="submit" onClick={onSubmit}>
              Submit
            </button>
          </form>
        </OverlayPanel>
      </>
    );
  };
 
  //Memoize Derived Data
  const displayRows = useMemo(()=> currentRows.slice(0, rowsperPage),[currentRows, rowsperPage])

  return (
    <div className="card">
      {/* Data table component */}
      <DataTable
        value={displayRows}
        selectionMode="multiple"
        selection={selectedRows}
        onSelectionChange={(e) => setSelectedRows(e.value)}
        dataKey="id"
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>
        <Column field="title" header={renderHeader()}></Column>
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="artist_display" header="Artist Display"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Date Start"></Column>
        <Column field="date_end" header="Date End"></Column>
      </DataTable>

      {/* paginator */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paginator
          className="paginator"
          first={first}
          rows={rowsperPage}
          totalRecords={pgination}
          onPageChange={onPageChange}
        />

        {/* rows per page Drowdown */}
        <Dropdown
          value={rowsperPage}
          options={[5, 10, 25, 50]}
          onChange={onRowsPerPageChange}
          placeholder="Select Rows Per Page"
        />
      </div>
    </div>
  );
}
