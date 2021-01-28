import React, { FC, useEffect, useContext, Fragment } from 'react';
import { pageContext } from './Layout';

// For useEffect functionality within class components.
// Yes, this is retarded.

interface IEffectProps {
  function: Function
  pageKey: string
}

const PageEffect: FC<IEffectProps> = (props) => {
  const currentPage = useContext(pageContext);
  useEffect(() => {
    if (currentPage === props.pageKey) {
      props.function();
    }
  }, [currentPage]);

  return <Fragment />;
}

export default PageEffect;