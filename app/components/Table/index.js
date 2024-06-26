import React from 'react';
import { useTable, useBlockLayout } from 'react-table';
import { FixedSizeList } from 'react-window';
import PropTypes from 'prop-types';
import { Styles } from './Styles';

export default function Table({ columns, data }) {
  // Use the state and functions returned from useTable to build your UI

  const defaultColumn = React.useMemo(
    () => ({
      width: 150
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
    prepareRow
  } = useTable(
    {
      columns,
      data,
      defaultColumn
    },
    useBlockLayout
  );

  const RenderRow = ({ index, style }) => {
    const row = rows[index];
    prepareRow(row);
    return (
      <div
        {...row.getRowProps({
          style
        })}
        className="tr"
      >
        {row.cells.map(cell => (
          <div {...cell.getCellProps()} className="td">
            {cell.render('Cell')}
          </div>
        ))}
      </div>
    );
  };

  // Render the UI for your table
  return (
    <Styles>
      <div {...getTableProps()} className="table">
        <div>
          {headerGroups.map(headerGroup => (
            <div {...headerGroup.getHeaderGroupProps()} className="tr">
              {headerGroup.headers.map(column => (
                <div {...column.getHeaderProps()} className="th">
                  {column.render('Header')}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div {...getTableBodyProps()}>
          <FixedSizeList
            height={600}
            itemCount={rows.length}
            itemSize={100}
            width={totalColumnsWidth}
            overscanCount={100}
          >
            {RenderRow}
          </FixedSizeList>
        </div>
      </div>
    </Styles>
  );
}
Table.propTypes = {
  index: PropTypes.number.isRequired,
  style: PropTypes.objectOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired
};
