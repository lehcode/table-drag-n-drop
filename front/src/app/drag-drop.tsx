import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from '@hello-pangea/dnd';
import axios from 'axios';

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

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get<ItemsResponse>('http://localhost:3000/api/items');
      setLeftItems(response.data.leftItems);
      setRightItems(response.data.rightItems);
      setAttachedIds(response.data.attachedIds);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  /**
  * Handles the end of a drag operation.
  *
  * @param {DragDropResult} result - The result of the drag operation.
  * @return {void}
  */
  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) return;

    if (result.source.droppableId === 'rightTable' && result.destination.droppableId === 'leftTable') {
      const draggedItem = rightItems[result.source.index];
      
      // Remove item from right table
      const newRightItems = Array.from(rightItems);
      newRightItems.splice(result.source.index, 1);
      setRightItems(newRightItems);

      // Add item to left table
      const newLeftItems = Array.from(leftItems);
      newLeftItems.splice(result.destination.index, 0, draggedItem);
      setLeftItems(newLeftItems);

      // Add ID to attachedIds
      setAttachedIds(prev => [...prev, draggedItem.id]);
    }
  };

  /**
  * Saves the current state of the drag and drop component by making a POST request to the server
  * and storing the data in local storage.
  *
  * @return {Promise<void>} - A promise that resolves when the data is successfully saved, or rejects
  * with an error if there was an issue saving the data.
  */
  const handleSave = async () => {
    try {
      await axios.post('http://localhost:3000/save', { leftItems, rightItems, attachedIds });
      localStorage.setItem('dragDropData', JSON.stringify({ leftItems, rightItems, attachedIds }));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  /**
  * Handles the undo operation for a specific index in the attachedIds array.
  *
  * @param {number} index - The index of the item to be undone.
  * @return {void} This function does not return anything.
  */
  const handleUndo = (index: number): void => {
    setAttachedIds(prev => {
      const newAttachedIds = [...prev];
      const removedId = newAttachedIds.splice(index, 1)[0];
      
      // Move item back to right table
      const itemToMove = leftItems.find(item => item.id === removedId);
      if (itemToMove) {
        setLeftItems(prev => prev.filter(item => item.id !== removedId));
        setRightItems(prev => [...prev, itemToMove]);
      }

      return newAttachedIds;
    });
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
        {attachedIds.map((id, index) => (
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