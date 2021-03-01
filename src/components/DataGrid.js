import { useState, useCallback, useEffect } from 'react';

// const { flatten, uniq, capitalize, isString, sortBy, reverse, isNumber } = _; // lodash
import {
  flatten,
  uniq,
  capitalize,
  isString,
  sortBy,
  reverse,
  isNumber,
} from 'lodash';

// Constants
const AZ = 1;
const ZA = 2;
const ORIG = 0;

///////////////////////////////////////////////////////////////////////////////
// DATA GRID COMPONENTS
///////////////////////////////////////////////////////////////////////////////
// A single cell in a data grid
// TODO: for img tag consider an alt tag
const Cell = ({ datum }) => {
  return (
    <td>
      {isString(datum) && datum.toLowerCase().endsWith('.png') ? (
        <img src={datum} />
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

  /* TODO: Load the data from the URL */
  // useEffect to load data
  // use native fetch api
  useEffect(() => {
    // My TODO: add loading status for data later
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

  // Preprocess the data to get a list of columns and add a helper index *** IMPORTANT
  // where is the helper idx?
  // what is uniq and flatten doing?
  // uniq create an array of unique values in order, from all given arrays
  // flatten used to flatten the array to one level deep (there are built in JS for this now)
  // what is object keys and filtering for?
  // need to process the columns to get ["state", "abbreviation", "population", "size", "flag"]
  const columns = uniq(
    flatten(
      // object.keys will get you an array of all the keys in that object
      // in this case it would get you ["state", "abbreviation", "population", "size", "flag"]
      data.map((row) => Object.keys(row).filter((key) => !key.startsWith('_')))
    )
  );
  // console.log(columns);
  // console.log("UNPROCESSED", data.map((row) => Object.keys(row).filter((key) => !key.startsWith('_'))))

  // State
  // this sortedOn piece of state is what is determining ascending or descending order
  const [sortedOn, setSortedOn] = useState([null, AZ]);
  const [pinnedColumns, setPinnedColumns] = useState([]);

  // my states
  const [orderedColumns, setOrderedColumns] = useState(columns);
  // Event handlers
  // usecallback is so that it memoizes between the renders the same function isn't recreated
  const onClick = useCallback(
    (col) => (event) => {
      if (event.metaKey) {
        // pinning
        /* TODO: implement the onclick handler for pinning */
        // setPinnedColumns in order to maintain order in which it was pinned
        // have to parse just the column data
        // setPinnedColumns([]);
        // possible on click add CSS class in order to change css to pin to the left
        // let pinTEST = columns.filter((column, i) => {
        //   return column === col;
        // });
        // unpinned feature
        if (pinnedColumns.includes(col)) {
          let removePinned = pinnedColumns.filter((column) => {
            return column !== col;
          });
          setPinnedColumns(removePinned);
        } else {
          setPinnedColumns([...pinnedColumns, col]);
        }

        // possible to grab all data of pinnedColumn and then rebuilding the data?
      } else {
        // sorting
        /* TODO: implement the onclick handler for sorting */
        // first click enables sorting in ascending order (A-Z)
        // second click descending order (Z-A)
        // third click or clicking any other column disables sorting and returns data grid to initial sorted order
        // sort and update data by setting state
        // console.log(data)
        // need the ability to sort ascending and descending as well as sorting numbers vs alphabet
        // how to check data in column?
        // sorted on how to change ascending and descending?
        let sortedOnCol = sortedOn[0];
        let colDirection = sortedOn[1];

        // conditionals to determine which click it should sort by
        if (
          (sortedOnCol === null && colDirection === AZ) ||
          (sortedOnCol === col && colDirection === ORIG)
        ) {
          console.log('first click on column');

          setSortedOn([col, AZ]);
          // means that this is the second time it's been clicked and need to be descending
        } else if (sortedOnCol === col && colDirection === AZ) {
          console.log('second click on column');
          setSortedOn([col, ZA]);
        } else {
          console.log('third click or click on a different column on column');
          // need to reset sort?
          setSortedOn([col, ORIG]);
        }
      }
    },
    [sortedOn, pinnedColumns, data]
  );

  /* TODO: Re-order columns and sort data (if necessary) */
  // useEffect when sortOn is changed?
  // MY TODO: rename sortendOn indexes to more human readable
  useEffect(() => {
    let sortedOnCol = sortedOn[0];
    let colDirection = sortedOn[1];
    console.log(sortedOn);
    if (colDirection === ORIG) {
      setData(unsortedData);
    } else {
      const sortedData = [...data].sort((a, b) => {
        // console.log(sortedOn)
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

  // when pinnedColumns are changed
  useEffect(() => {
    // do something with the list of pinned cols
    let reorderedColumns = [
      ...pinnedColumns,
      ...columns.filter((col) => !pinnedColumns.includes(col)),
    ];
    setOrderedColumns(reorderedColumns);
  }, [pinnedColumns]);

  // another useEffect when you are setting pinned data
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
