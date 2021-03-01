import { useState, useCallback, useEffect } from 'react';

import { flatten, uniq, capitalize, isString, isNumber } from 'lodash';

// Constants
const AZ = 1;
const ZA = 2;
const ORIG = 0;

///////////////////////////////////////////////////////////////////////////////
// DATA GRID COMPONENTS
///////////////////////////////////////////////////////////////////////////////
// A single cell in a data grid
const Cell = ({ datum }) => {
  // parse datum for flag of <state> name as alt
  if (isString(datum) && datum.toLowerCase().endsWith('.png')) {
    // helper function to get a parse
    const parseAlt = (str) => {
      const arr = str.split('/');
      for (let el of arr) {
        if (el.includes('Flag')) {
          return el.split('.')[0];
        }
      }
    };
    var flagAlt = parseAlt(datum);
  }

  return (
    <td>
      {isString(datum) && datum.toLowerCase().endsWith('.png') ? (
        <img src={datum} alt={flagAlt} />
      ) : isNumber(datum) ? (
        datum.toLocaleString()
      ) : (
        datum
      )}
    </td>
  );
};

// A cell in a header row in a data grid
const HeaderCell = ({ title, onClick }) => {
  return <th onClick={onClick}>{capitalize(title)}</th>;
};

///////////////////////////////////////////////////////////////////////////////
// DATAGRID COMPONENT WITH INSTANTIATION
///////////////////////////////////////////////////////////////////////////////
const DataGrid = () => {
  // Load the data from JSON, which you can find at:
  // https://assets.codepen.io/5781725/states-data.json
  // We include some data for testing purposes
  const [data, setData] = useState([
    {
      state: 'Alabama',
      abbreviation: 'AL',
      population: 4921532,
      size: 52420.07,
    },
    {
      state: 'Alaska',
      abbreviation: 'AK',
      population: 731158,
      size: 665384.04,
    },
  ]);
  const [unsortedData, setUnsortedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // need to process the columns to get ["state", "abbreviation", "population", "size", "flag"] for column headers
  const columns = uniq(
    flatten(
      data.map((row) => Object.keys(row).filter((key) => !key.startsWith('_')))
    )
  );

  // State
  const [sortedOn, setSortedOn] = useState([null, AZ]);
  const [pinnedColumns, setPinnedColumns] = useState([]);

  const [orderedColumns, setOrderedColumns] = useState(columns);

  const onClick = useCallback(
    (col) => (event) => {
      if (event.metaKey) {
        if (pinnedColumns.includes(col)) {
          let removePinned = pinnedColumns.filter((column) => {
            return column !== col;
          });
          setPinnedColumns(removePinned);
        } else {
          setPinnedColumns([...pinnedColumns, col]);
        }
      } else {
        let sortedOnCol = sortedOn[0];
        let colDirection = sortedOn[1];

        // conditionals to determine which click it should sort by
        // there is a useEffect that tracks changes on sortedOn
        if (
          (sortedOnCol === null && colDirection === AZ) ||
          (sortedOnCol === col && colDirection === ORIG)
        ) {
          setSortedOn([col, AZ]);
          // means that this is the second time it's been clicked and need to be descending
        } else if (sortedOnCol === col && colDirection === AZ) {
          setSortedOn([col, ZA]);
        } else {
          setSortedOn([col, ORIG]);
        }
      }
    },
    [sortedOn, pinnedColumns, data]
  );

  useEffect(() => {
    async function fetchStates() {
      const baseURL = 'https://assets.codepen.io/5781725/states-data.json';
      try {
        const response = await fetch(baseURL);
        const states = await response.json();
        setData(states);
        setUnsortedData(states);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    }
    fetchStates();
  }, []);

  useEffect(() => {
    let sortedOnCol = sortedOn[0];
    let colDirection = sortedOn[1];
    if (colDirection === ORIG) {
      setData(unsortedData);
    } else {
      const sortedData = [...data].sort((a, b) => {
        if (a[sortedOnCol] < b[sortedOnCol]) {
          // check for ascending or descending
          return colDirection === AZ ? -1 : 1;
        }
        if (a[sortedOnCol] > b[sortedOnCol]) {
          return colDirection === AZ ? 1 : -1;
        }
        return 0;
      });
      setData(sortedData);
    }
  }, [sortedOn]);

  useEffect(() => {
    let reorderedColumns = [
      ...pinnedColumns,
      ...columns.filter((col) => !pinnedColumns.includes(col)),
    ];
    setOrderedColumns(reorderedColumns);
  }, [pinnedColumns]);

  useEffect(() => {
    if (pinnedColumns.length === 0) {
      setOrderedColumns(columns);
    }
  }, [data]);

  if (isLoading) {
    return <i>Loading...</i>;
  } else {
    return (
      <div className="table-container">
        <table>
          <colgroup>
            {orderedColumns.map((col, i) => {
              return (
                <col
                  key={i}
                  className={
                    pinnedColumns.includes(col) ? `${col} pinned` : col
                  }
                />
              );
            })}
          </colgroup>
          <thead>
            <tr>
              {/* ["state", "abbreviation", "population", "size", "flag"] */}
              {orderedColumns.map((col, i) => (
                <HeaderCell key={i} title={col} onClick={onClick(col)} />
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {orderedColumns.map((col, j) => (
                  <Cell key={j} datum={row[col]} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
};

export default DataGrid;
