// Dependency imports
import React, { useState, useImperativeHandle, useCallback, useEffect, useContext, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import CheckIcon from '@material-ui/icons/Check';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import _ from 'lodash';

// Context imports
import AppContext from '../../AppContext.js';
import ModalContext from './ModalContext.js';

// Component imports
import ActionButton from './ActionButton.jsx';

const modalElement = document.getElementById('modal-root');

// MODAL
export const Modal = ({ product, fade = false }, ref) => {
  // CONTEXT
  const { selectedProductContext } = useContext(AppContext);

  // STATE
  const [selectedProduct, setSelectedProduct] = selectedProductContext;
  const [isOpen, setIsOpen] = useState(false);

  // HOOKS
  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        setIsOpen(true);
      },
      close,
    }),
    [close]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape, false);
      document.addEventListener('click', handleEscape, false);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape, false);
      document.addEventListener('click', handleEscape, false);
    };
  }, [handleEscape, isOpen]);

  // HELPER FUNCTIONS: Event Handlers
  // Closes modal
  const close = () => {
    setIsOpen(false);
  };

  // Triggers close on escape keydown or click
  const handleEscape = useCallback(e => {
    if (e.keyCode === 27) { close(); }
  }, [close]);


  // HELPER FUNCTIONS: Table Rendering
  const renderTable = (currentProduct, comparedProduct) => {
    const categoriesArray = _.union([...Object.keys(currentProduct)], [...Object.keys(comparedProduct)]);
    const formattedCurrentProductArray = mapProductValues([...Object.values(currentProduct)]);
    const formattedComparedProductArray = mapProductValues([...Object.values(comparedProduct)]);
    const formattedCategoriesArray = mapCategories(categoriesArray);

    return (
      filterArraysByFeature(formattedCurrentProductArray, formattedCategoriesArray, formattedComparedProductArray)
    );
  };

  const filterArraysByFeature = (currentProductArray, categoryArray, compareProductArray) => {
    const tableArray = [currentProductArray, categoryArray, compareProductArray];
    const len = getMaxLengthOfCombinedArrays(tableArray);
    let comparisonTable = [];

    for (let i = 0; i < len; i++) {
      comparisonTable.push(renderRows(tableArray[0][i], tableArray[1][i], tableArray[2][i]));
    }

    return comparisonTable;
  };

  // Returns a row === | product | category | product |
  const renderRows = (leftProduct, category, rightProduct) => {
    if (category === 'Name') {
      return renderNameColumn(leftProduct, category, rightProduct);
    } else if (category === 'Features') {
      const rightFeatures = getFeatures(rightProduct);
      const leftFeatures = getFeatures(leftProduct);
      const leftValues = getValues(leftProduct);
      const rightValues = getValues(rightProduct);
      const features = _.union(leftFeatures, rightFeatures);

      // console.log('RIGHT FEATURES::', rightFeatures);
      // console.log('RIGHT VALUES::', rightValues);
      // console.log('LEFT FEATURES::', leftFeatures);
      // console.log('LEFT VALUES::', leftValues);

      return getRows(leftProduct, features, rightProduct);
    } else {
      return;
    }
  };

  const renderNameColumn = (leftProduct, category, rightProduct) => {
    return (
      <ModalBoldRow key={category ? category : null}>
        <td>{`${leftProduct}`}</td>
        <VS>vs</VS>
        <td>{`${rightProduct}`}</td>
      </ModalBoldRow>
    );
  };

  const renderRow = (leftValue, feature, rightValue) => {

    return (
      <ModalRow key={feature ? feature : null}>
        <RightAndLeftRowFeature>
          {typeof leftValue === 'boolean' ? <CheckIcon /> : !leftValue ? <NotInterestedIcon /> : leftValue}
        </RightAndLeftRowFeature>
        <ProductMiddleFeature>
          {feature}
        </ProductMiddleFeature>
        <RightAndLeftRowFeature>
          {typeof rightValue === 'boolean' ? <CheckIcon /> : !rightValue ? <NotInterestedIcon /> : rightValue}
        </RightAndLeftRowFeature>
      </ModalRow>
    );
  };

  // Please don't yell at me
  const getMaxLengthOfCombinedArrays = (arr) => {
    return Math.max(...[...arr.map(e => e ? e.length : 0), arr.length]);
  };

  const getFeatures = (featuresArray) => {
    return featuresArray?.map(product => { return product[1].feature; });
  };

  const getValues = (valuesArray) => {
    return valuesArray?.map(product => { return product[1].value; });
  };

  const getRows = (leftProduct, featuresArr, rightProduct) => {

    return featuresArr.map((feature) => {
      let left = null;
      let right = null;
      if (leftProduct && Array.isArray(leftProduct)) {
        for (let i = 0; i < leftProduct.length; i++) {
          let lProduct = leftProduct[i][1];
          console.log('CURRENT LEFT INDEX::', lProduct);
          if (lProduct.feature === feature) {
            left = lProduct.value;
          } else {
            null;
          }
        }
      }

      console.log(feature);

      if (rightProduct && Array.isArray(rightProduct)) {
        for (let j = 0; j < rightProduct.length; j++) {
          let rProduct = rightProduct[j][1];
          console.log('CURRENT R INDEX::', rProduct);
          if (rProduct.feature === feature) {
            right = rProduct.value;
          } else {
            null;
          }
        }
      }

      return renderRow(left, feature, right);
    });
  };

  // HELPER FUNCTIONS: Formatting
  const mapProductValues = (listToMap) => {
    return listToMap.map(currentValue => {
      if (typeof currentValue === 'object' ) {
        return [...Object.entries(currentValue)];
      } else {
        return formatValue(currentValue);
      }
    });

  };

  const mapCategories = (categoryList) => {
    return categoryList.map(product => {
      return formatWord(product);
    });
  };

  const formatWord = (wordToBeFormatted) => {
    let capitalizedWord = capitalize(wordToBeFormatted);
    let formattedWord = capitalizedWord.replace('_', ' ');
    return formattedWord;
  };

  const formatValue = (valueToFormat) => {
    return valueToFormat.toString();
  };

  const capitalize = (wordToCapitalize) => {
    if (typeof wordToCapitalize !== 'string') {
      wordToCapitalize = wordToCapitalize.toString();
    }
    let capitalizedWord = wordToCapitalize.toLowerCase();
    let firstLetter = capitalizedWord.slice(0, 1).toUpperCase();
    capitalizedWord = firstLetter.concat(capitalizedWord.slice(1));
    return capitalizedWord;
  };

  // JSX
  return createPortal(
    // Show or hide depending on click
    isOpen ? (
      <ModalStyle className={`modal ${fade ? 'modal-fade' : ''}`}>
        <ModalOverlay onClick={close}>
          <ModalClose onClick={close}>
            <ActionButton name="close-modal" />
          </ModalClose>
          <ModalBody className="modal-body">

            <ModalTable>
              <thead>
                <ModalBoldRow>
                </ModalBoldRow>
              </thead>
              <tbody>
                {renderTable(product, selectedProduct)}
              </tbody>
            </ModalTable>
          </ModalBody>
        </ModalOverlay>
      </ModalStyle>
    ) : null,
    modalElement
  );
};

export default forwardRef(Modal);

// STYLES
const fadeIn = keyframes`
  0% {
    animation-timing-function: cubic-bezier(0.2242, 0.7499, 0.3142, 0.8148);
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const ModalStyle = styled.div`
  position: fixed;
  overflow: hidden;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5em 1em;
  z-index: 999999;
  box-sizing: border-box;
`;

const ModalFade = styled.div`
  animation: ${fadeIn} 1s 1 linear;
  animation-fill-mode: forwards;
  opacity: 0;
`;

const ModalOverlay = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const VS = styled.td `
  float: center;
`;

const ModalClose = styled.a`
  position: absolute;
  right: 15px;
  top: 10px;
  color: #38062b;
  cursor: pointer;
  font-size: 1.25em;
  padding: 7px;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  box-sizing: border-box;
  display: inline-block;
  text-align: center;
  :hover & {
    background: rgba(1, 1, 1, 0.989);
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: row;
  text-align: center;
  z-index: 2;
  position: relative;
  justify-content: center;
  margin: 0 auto;
  background-color: #b1a9ac;
  color: #38062b;
  box-shadow: 5px 5px 5px 5px;
  border: 1px solid #fdf0d5;
  border-radius: 3px;
  overflow-x: hidden;
  overflow-y: auto;
  width: 500px;
  height: 350px;
  padding: 15px 20px;
`;

const CategoryRowItem = styled.tr`
  color: rgba(65, 65, 65, 1);
  list-style-type: none;
  margin: 0 auto;
  padding: 5px;
  max-width: 150px;
`;

const ModalRow = styled.tr`
  color: #38062b;
  margin: 0 auto;
  padding: 1px;
`;

const ModalBoldRow = styled.tr`
  font-family: 'Open Sans';
  font-weight: bold;
  color: #38062b;
  margin: 0 auto;
  padding: 1px;
`;

const ModalTitle = styled.h2`
  float: center;
  justify-content: center;
  font-family: 'Open Sans';
  color: #38062b;
`;
const ModalTable = styled.table`
`;
const RightAndLeftRowFeature = styled.td `
  font-family: 'Open Sans';
  font-style: italic;
  font-size: small;
  padding: 10px;
`;
const ProductMiddleFeature = styled.td`
  font-family: 'Open Sans';
  padding: 3px;
`;
// const mapProductValues = (listToMap, id) => {
//   let mappedList = listToMap.map(currentValue => {
//     let formattedCurrentValue;
//     if (typeof currentValue === 'object' ) {
//       return <br></br>;
//     } else {
//       formattedCurrentValue = formatValue(currentValue);
//     }
//     return (
//       <CategoryRowItem key={`${formattedCurrentValue}-${id}`}>
//         {typeof currentValue === 'object' ? <br></br> : currentValue }
//       </CategoryRowItem>
//     );
//   });
//   return mappedList;
// };

// const mapCategories = (categoryList, id) => {
//   let mappedCategories = categoryList.map(product => {
//     let category = formatWord(product);
//     return (
//       <CategoryRowItem key={`${category}-${id}`}>
//         {category}
//       </CategoryRowItem>
//     );
//   });
//   return mappedCategories;
// };
