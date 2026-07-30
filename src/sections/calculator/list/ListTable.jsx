import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import axiosServices from 'utils/axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// react-bootstrap
import Badge from 'react-bootstrap/Badge';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Stack from 'react-bootstrap/Stack';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';

// project-imports
import MainCard from 'components/MainCard';
import SortingData from 'components/third-party/react-table/SortingData';
import DebouncedInput from 'components/third-party/react-table/DebouncedInput';
import { getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table';

// third-party
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

// Default avatars (use random based on index)
import Image1 from 'assets/images/user/avatar-1.png';
import Image2 from 'assets/images/user/avatar-2.png';
import Image3 from 'assets/images/user/avatar-5.png';
import Image4 from 'assets/images/user/avatar-9.png';
import Image5 from 'assets/images/user/avatar-10.png';

const avatarList = [Image1, Image2, Image3, Image4, Image5];

/* ----------------------------------------------------------
   REACT TABLE
-----------------------------------------------------------*/
function ReactTable({ columns, data }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  });

  const table = useReactTable({
    data,
    columns,

    state: {
      globalFilter,
      pagination
    },

    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <>
      <Stack direction="horizontal" className="justify-content-between align-items-center flex-wrap p-4 pt-0" gap={2}>
        <SortingData getState={table.getState} setPageSize={table.setPageSize} />
        <div className="datatable-search">
          <DebouncedInput value={globalFilter ?? ''} onFilterChange={(value) => setGlobalFilter(String(value))} />
        </div>
      </Stack>

      <Table responsive hover className="mb-0 border-top">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

/* ----------------------------------------------------------
   MAIN COMPONENT
-----------------------------------------------------------*/
export default function ListTable() {
  const [allVisits, setAllVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  const navigate = useNavigate();

  /* ----------------------------------------------------------
     FETCH STRUCTURES + VISITS
  -----------------------------------------------------------*/
  const fetchData = async () => {
    try {
      const res = await axiosServices.get('http://localhost:8000/api/admin/structures');

      const structures = res.data.structures || res.data.data?.structures || [];

      const flatten = [];
      let rowIndex = 0;

      structures.forEach((s) => {
        (s.visits || []).forEach((v) => {
          rowIndex++;

          flatten.push({
            id: rowIndex,
            visitId: v._id,
            structureId: s._id,
            structureName: s.name,
            visitName: v.visitName || 'Untitled Visit',

            status: v.status || 'pending',
            badge: (v.status || 'pending').charAt(0).toUpperCase() + (v.status || 'pending').slice(1),
            badgeClass:
              (v.status === 'pending' && 'light-warning') ||
              (v.status === 'inprogress' && 'light-primary') ||
              (v.status === 'completed' && 'light-success') ||
              'light-secondary',

            createdAt: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-',
            updatedAt: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '-',

            rawVisit: v
          });
        });
      });

      // FIXED
      setAllVisits(flatten);
    } catch (error) {
      console.error('Fetch error', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ----------------------------------------------------------
     ACTION HANDLERS
  -----------------------------------------------------------*/
  const handleView = (row) => navigate(`/calculate/usermain/${row.structureId}?visitId=${row.visitId}`);

  const handleEdit = (row) => navigate(`/calculate/usermain/${row.structureId}?visitId=${row.visitId}&mode=edit`);

  const handleDelete = async (row) => {
    console.log('delete');
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosServices.delete(`http://localhost:8000/api/admin/structures/${row.structureId}/visits/${row.visitId}`);

          Swal.fire('Deleted!', 'Visit has been deleted.', 'success');

          // optional: refresh table
          fetchData();
        } catch (err) {
          Swal.fire('Error!', 'Something went wrong!', 'error');
        }
      }
    });
  };

  /* ----------------------------------------------------------
     SAME UI COLUMNS, CONTENT CHANGED
  -----------------------------------------------------------*/
  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => row.index + 1 // prints 1, 2, 3...
    },
    {
      header: 'Structure Name',
      accessorKey: 'structureName',
      cell: ({ row }) => (
        <Stack direction="horizontal" gap={2} className="align-items-center">
          <Stack>
            <h6 className="mb-1">{row.original.structureName}</h6>
          </Stack>
        </Stack>
      )
    },
    {
      header: 'Visit Name',
      accessorKey: 'visitName',
      cell: ({ row }) => (
        <Stack direction="horizontal" gap={2} className="align-items-center">
          <Stack>
            {/* Main visit name */}
            <h6 className="mb-1 text-truncate">{row.original.visitName}</h6>
          </Stack>
        </Stack>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Created'
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated'
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge bg={row.original.badgeClass}>{row.original.badge}</Badge>
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <Stack direction="horizontal" gap={1}>
          <OverlayTrigger overlay={<Tooltip>View</Tooltip>}>
            <i className="ti ti-eye f-20 cursor-pointer" onClick={() => handleView(row.original)} />
          </OverlayTrigger>

          <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
            <i className="ti ti-edit f-20 cursor-pointer" onClick={() => handleEdit(row.original)} />
          </OverlayTrigger>

          <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
            <i className="ti ti-trash f-20 text-danger cursor-pointer" onClick={() => handleDelete(row.original)} />
          </OverlayTrigger>
        </Stack>
      )
    }
  ];

  /* ----------------------------------------------------------
     TABS
  -----------------------------------------------------------*/
  const filteredData = activeTab === 'all' ? allVisits : allVisits.filter((i) => i.badge.toLowerCase() === activeTab.toLowerCase());

  const tabCounts = {
    all: allVisits.length,
    pending: allVisits.filter((i) => i.badge === 'Pending').length,
    inprogress: allVisits.filter((i) => i.badge === 'Inprogress').length,
    completed: allVisits.filter((i) => i.badge === 'Completed').length
  };

  return (
    <MainCard className="table-card">
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav className="nav-tabs invoice-tab p-4">
          <Nav.Item>
            <Nav.Link eventKey="all">
              <Stack direction="horizontal" gap={2}>
                All
                <Badge pill bg="light-primary">
                  {tabCounts.all}
                </Badge>
              </Stack>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link eventKey="pending">
              <Stack direction="horizontal" gap={2}>
                Pending
                <Badge pill bg="light-warning">
                  {tabCounts.pending}
                </Badge>
              </Stack>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link eventKey="inprogress">
              <Stack direction="horizontal" gap={2}>
                In Progress
                <Badge pill bg="light-primary">
                  {tabCounts.inprogress}
                </Badge>
              </Stack>
            </Nav.Link>
          </Nav.Item>

          <Nav.Item>
            <Nav.Link eventKey="completed">
              <Stack direction="horizontal" gap={2}>
                Completed
                <Badge pill bg="light-success">
                  {tabCounts.completed}
                </Badge>
              </Stack>
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey={activeTab}>
            <ReactTable data={filteredData} columns={columns} />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </MainCard>
  );
}

ReactTable.propTypes = { columns: PropTypes.array, data: PropTypes.array };
