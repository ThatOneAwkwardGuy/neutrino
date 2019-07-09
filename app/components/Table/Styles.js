import styled, { css } from 'styled-components';

export const Table = styled.div`
  display: block;
  overflow: scroll;
`;

const RowBase = styled.div`
  display: flex;
  text-align: center;
  :last-child {
    border-bottom: 0;
  }
`;

export const Row = RowBase;

export const HeaderRow = RowBase;

export const Pagination = styled(RowBase)`
  background: rgba(42, 117, 146, 1);
  color: white;
`;

export const Cell = styled.div`
  padding: 0.6rem;
`;

export const Header = styled(Cell)`
  font-weight: bold;

  ${props => {
    const width = (props.sortedIndex + 1) * 5;
    return (
      props.sorted &&
      (props.sortedDesc
        ? css`
            box-shadow: inset 0 ${width}px hsla(0, 100%, 40%);
          `
        : css`
            box-shadow: inset 0 -${width}px hsl(55, 100%, 50%);
          `)
    );
  }};
`;

export const Button = styled.button`
  font-size: 1rem;
  padding: 0.5rem 0.7rem;
  background: white;
  cursor: pointer;

  :disabled {
    opacity: 0.3;
  }
`;

export const Select = styled.select`
  appearance: none;
  background: white;
  border: 0;
  margin: 0;
  color: black;
  font-size: 1rem;
  border-radius: 5px;
  padding: 0.5rem 0.7rem;
  border: 0;
  cursor: pointer;
`;

export const Input = styled.input`
  font-size: 1rem;
  padding: 0.5rem 0.7rem;
  background: white;
  border-radius: 5px;
  max-width: 100%;
`;

export const Emoji = styled.span`
  font-size: 1rem;
  margin: 0 0.3rem;
  display: inline-block;
  transform: scale(1.4);
`;
