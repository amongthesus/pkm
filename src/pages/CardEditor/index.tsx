import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'interfaces';
import { cardToHttpCard } from 'utils/card';
import { useDispatch, useSelector } from 'react-redux';
import { initialCardCreatorState } from 'redux/ducks/cardCreator/reducer';
import Motion from 'pages/Motion';
import { HttpCard } from 'interfaces/http';
import Creator from 'components/Creator';
import { useHistory, useLocation } from 'react-router-dom';
import { selectCardOptions } from 'redux/ducks/cardOptions/selectors';
import { getCard, updateCard } from 'redux/ducks/card/actions';
import { selectCard } from 'redux/ducks/card/selectors';
import { cardToFormData } from 'utils/creator';

const CardEditorPage: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const location = useLocation();
  const options = useSelector(selectCardOptions);
  const detailCard = useSelector(selectCard);
  const cardData = useRef<Card>();
  const [cardRetrieved, setCardRetrieved] = useState<boolean>(false);
  const [importCard, setImportCard] = useState<HttpCard>(initialCardCreatorState.card);

  /**
   * Retrieve card by path id, but only once and after cardOptions are retrieved
   */
  useEffect(() => {
    if(!cardRetrieved) {
      (async () => {
        await dispatch(getCard({
          id: +location.pathname.replace('/edit/', ''),
          options
        }));
        await setCardRetrieved(true);
      })();
    }
  }, [dispatch, location, options, cardRetrieved]);

  useEffect(() => {
    setImportCard(cardToHttpCard(detailCard));
  }, [detailCard]);

  /**
   * The function that will be called once the 'Save Card' button is pressed'
   * Updates the card to the database
   * @param card The card to save
   */
  const save = async (card: Card) => {
    const formData = await cardToFormData(card);
    if(detailCard.id && formData) {
      dispatch(updateCard({
        card: formData,
        id: detailCard.id,
        options,
        history,
      }));
    }
  }

  return (
    <Motion>
      <Creator card={importCard} cardRef={cardData} saveFn={save} />
    </Motion>
  )
}

export default CardEditorPage;
