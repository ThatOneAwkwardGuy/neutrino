import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { FixedSizeList as List } from 'react-window';
import {
  useTable,
  useColumns,
  useRows,
  useGroupBy,
  useFilters,
  useSortBy,
  useExpanded,
  usePagination,
  useFlexLayout
} from 'react-table';

import { Table, Row, HeaderRow, Header, Cell } from './Styles';

const useInfiniteScroll = ({ enabled, sortBy, groupBy, filters }) => {
  const listRef = useRef();
  const [scrollToIndex, setScrollToIndex] = useState(0);
  const [rowHeight, setRowHeight] = useState(40);
  const [height, setHeight] = useState(500);
  const [overscan, setOverscan] = useState(25);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (listRef.current) {
      listRef.current.scrollToItem(scrollToIndex, 'start');
    }
  }, [scrollToIndex]);

  useEffect(() => {}, []);

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }
    if (listRef.current) {
      listRef.current.scrollToItem(0, 'start');
    }
  }, [sortBy, groupBy, filters]);

  return {
    listRef,
    scrollToIndex,
    setScrollToIndex,
    rowHeight,
    setRowHeight,
    height,
    setHeight,
    overscan,
    setOverscan
  };
};

export default function MyTable({ loading, infinite, ...props }) {
  const instance = useTable(
    {
      ...props
    },
    useColumns,
    useRows,
    useGroupBy,
    useFilters,
    useSortBy,
    useExpanded,
    usePagination,
    useFlexLayout
  );

  const {
    getTableProps,
    headerGroups,
    rows,
    getRowProps,
    state: [{ pageIndex, pageSize, sortBy, groupBy, filters }],
    prepareRow
  } = instance;

  const { listRef, rowHeight, overscan } = useInfiniteScroll({
    enabled: infinite,
    sortBy,
    groupBy,
    filters,
    pageIndex,
    pageSize
  });

  const renderRow = (row, index, style = {}) => {
    if (!row) {
      return <span />;
    }
    prepareRow(row);
    return (
      <Row {...row.getRowProps({ style, even: index % 2 })}>
        {row.cells.map(cell => (
          <Cell {...cell.getCellProps()}>{cell.render('Cell')}</Cell>
        ))}
      </Row>
    );
  };

  const tableBody = (
    <List
      ref={listRef}
      height={500}
      itemCount={rows.length + 1}
      itemSize={rowHeight}
      overscanCount={overscan}
      scrollToAlignment="start"
      {...getRowProps()}
    >
      {({ index, style }) => {
        const row = rows[index];
        return renderRow(row, index, style);
      }}
    </List>
  );

  return (
    <div>
      <Table {...getTableProps()}>
        {headerGroups.map(headerGroup => (
          <HeaderRow {...headerGroup.getRowProps()}>
            {headerGroup.headers.map(column => (
              <Header
                {...column.getHeaderProps()}
                sorted={column.sorted}
                sortedDesc={column.sortedDesc}
                sortedIndex={column.sortedIndex}
              >
                <div>
                  <span {...column.getSortByToggleProps()}>
                    {column.render('Header')}
                  </span>
                </div>
                {column.canFilter ? <div>{column.render('Filter')}</div> : null}
              </Header>
            ))}
          </HeaderRow>
        ))}
        {tableBody}
      </Table>
    </div>
  );
}

MyTable.propTypes = {
  loading: PropTypes.bool.isRequired,
  infinite: PropTypes.bool.isRequired
};
