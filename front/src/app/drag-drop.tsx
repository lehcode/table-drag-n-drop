/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import axios from 'axios';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';

type Item = {
  id: string;
  description: string;
}

type ItemsResponse = {
  leftItems: Item[],
  rightItems: Item[],
  attachedIds: string[]
}

/**
 * Renders a drag and drop component that allows the user to move items between two tables.
 *
 * @return {ReactElement} The rendered drag and drop component.
 */
const DragDropComponent: React.FC = () => {
  const [leftItems, setLeftItems] = useState<Item[]>([]);
  const [rightItems, setRightItems] = useState<Item[]>([]);
  const [attachedIds, setAttachedIds] = useState<string[]>([]);

  const state$ = new BehaviorSubject<ItemsResponse>({ leftItems: [], rightItems: [], attachedIds: [] });

  useEffect(() => {
    const fetchItems$ = axios.get<ItemsResponse>('http://localhost:3000/api/items');

    const dragEnd$ = fromEvent<CustomEvent>(document, 'dragend').pipe(
      map(event => event.detail),
      tap(result => {
        if (!result.destination) return;
        if (result.source.droppableId === 'rightTable' && result.destination.droppableId === 'leftTable') {
          const currentState = state$.getValue();
          const draggedItem = currentState.rightItems[result.source.index];
          
          const newRightItems = currentState.rightItems.filter((_, index) => index !== result.source.index);
          const newLeftItems = [
            ...currentState.leftItems.slice(0, result.destination.index),
            draggedItem,
            ...currentState.leftItems.slice(result.destination.index)
          ];
          const newAttachedIds = [...currentState.attachedIds, draggedItem.id];

          state$.next({ leftItems: newLeftItems, rightItems: newRightItems, attachedIds: newAttachedIds });
        }
      })
    );

    const undo$ = fromEvent<CustomEvent>(document, 'undo').pipe(
      map(event => event.detail as number),
      tap(index => {
        const currentState = state$.getValue();
        const newAttachedIds = currentState.attachedIds.filter((_, i) => i !== index);
        const removedId = currentState.attachedIds[index];
        const itemToMove = currentState.leftItems.find(item => item.id === removedId);
        
        if (itemToMove) {
          const newLeftItems = currentState.leftItems.filter(item => item.id !== removedId);
          const newRightItems = [...currentState.rightItems, itemToMove];

          state$.next({ leftItems: newLeftItems, rightItems: newRightItems, attachedIds: newAttachedIds });
        }
      })
    );

    const save$ = fromEvent(document, 'save').pipe(
      switchMap(() => {
        const currentState = state$.getValue();
        return axios.post('http://localhost:3000/api/save', currentState);
      }),
      tap(() => {
        localStorage.setItem('dragDropData', JSON.stringify(state$.getValue()));
      })
    );

    const subscription = merge(fetchItems$, dragEnd$, undo$, save$).subscribe({
      next: (response) => {
        if (response && 'data' in response) {
          state$.next(response.data);
        }
      },
      error: (error) => console.error('Error:', error)
    });

    state$.subscribe(state => {
      setLeftItems(state.leftItems);
      setRightItems(state.rightItems);
      setAttachedIds(state.attachedIds);
    });

    return () => subscription.unsubscribe();
  }, []);


  
  const onDragEnd: OnDragEndResponder = (result) => {
    document.dispatchEvent(new CustomEvent('dragend', { detail: result }));
  };

  
  const handleSave = async () => {
    document.dispatchEvent(new Event('save'));
  };

  /**
  * Handles the undo operation for a specific index in the attachedIds array.
  *
  * @param {number} index - The index of the item to be undone.
  * @return {void} This function does not return anything.
  */
  const handleUndo = (index: number): void => {
    document.dispatchEvent(new CustomEvent('undo', { detail: index }));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Droppable droppableId="leftTable">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ width: '45%', border: '1px solid #ccc', padding: '10px' }}>
              <h2>Left Table</h2>
              {leftItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{ 
                        userSelect: 'none',
                        padding: '16px',
                        margin: '0 0 8px 0',
                        backgroundColor: '#f9f9f9',
                        ...provided.draggableProps.style
                      }}
                    >
                      {item.description}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <Droppable droppableId="rightTable">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ width: '45%', border: '1px solid #ccc', padding: '10px' }}>
              <h2>Right Table</h2>
              {rightItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{ 
                        userSelect: 'none',
                        padding: '16px',
                        margin: '0 0 8px 0',
                        backgroundColor: '#f9f9f9',
                        ...provided.draggableProps.style
                      }}
                    >
                      {item.description}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>Attached IDs:</h3>
        {attachedIds?.map((id, index) => (
          <div key={index}>
            {id} <button onClick={() => handleUndo(index)}>Undo</button>
          </div>
        ))}
      </div>
      <button onClick={handleSave} style={{ marginTop: '10px' }}>Save</button>
    </DragDropContext>
  );
};

export default DragDropComponent;