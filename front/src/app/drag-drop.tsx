/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from '@hello-pangea/dnd';
import axios from 'axios';
import { Item, ItemsResponse } from 'types';

/**
 * Renders a drag and drop component with two tables: left table and right table.
 * The component allows users to drag items from the left table to the right table.
 * The dragged items are added to the attachedIds list.
 * The component also allows users to undo the last drag operation by removing an item from the attachedIds list.
 * The component saves the leftItems, rightItems, and attachedIds to the local storage when the save button is clicked.
 * The component displays a success message for 3 seconds after a successful save.
 *
 * @return {JSX.Element} The rendered drag and drop component.
 */
const DragDropComponent: React.FC = () => {
  const [leftItems, setLeftItems] = useState<Item[]>([]);
  const [rightItems, setRightItems] = useState<Item[]>([]);
  const [attachedIds, setAttachedIds] = useState<number[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('dragDropData');
    if (storedData) {
      const { leftItems, rightItems, attachedIds }: ItemsResponse =
        JSON.parse(storedData);
      setLeftItems(leftItems);
      setRightItems(rightItems);
      setAttachedIds(attachedIds);
    } else {
      fetchItems();
    }
  }, []);

  /**
   * Fetches items from the server and updates the component state with the response data.
   *
   * @return {Promise<void>} A promise that resolves when the items are fetched and the state is updated.
   */
  const fetchItems = async () => {
    try {
      const response = await axios.get<ItemsResponse>(
        'http://localhost:3000/api/items'
      );
      setLeftItems(response.data.leftItems);
      setRightItems(response.data.rightItems);
      setAttachedIds(response.data.attachedIds);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  /**
   * Handles the drag end event and updates the state based on the drag result.
   *
   * @param {OnDragEndResponder} result - The result of the drag end event.
   * @return {void}
   */
  const onDragEnd: OnDragEndResponder = (result) => {
    if (!result.destination) return;

    if (
      result.source.droppableId === 'rightTable' &&
      result.destination.droppableId === 'leftTable'
    ) {
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
      setAttachedIds((prev) => [...prev, draggedItem.id]);
    }
  };

  /**
   * Saves the current state of the drag and drop component by sending a POST request to the server
   * and storing the data in local storage. Also sets a state variable to indicate a successful save.
   *
   * @return {Promise<void>} A promise that resolves when the save operation is complete.
   */
  const handleSave = async () => {
    const data = { leftItems, rightItems, attachedIds };
    await axios.post('http://localhost:3000/api/save', data);
    localStorage.setItem('dragDropData', JSON.stringify(data));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  /**
   * Handles the undo operation for removing an item from the attached IDs list.
   * Moves the item back to the right table if it exists in the left table.
   *
   * @param {number} index - The index of the item to be undone.
   * @return {void}
   */
  const handleUndo = (index: number): void => {
    setAttachedIds((prev) => {
      const newAttachedIds = [...prev];
      const removedId = newAttachedIds.splice(index, 1)[0];

      // Move item back to right table
      const itemToMove = leftItems.find((item) => item.id === removedId);
      if (itemToMove) {
        setLeftItems((prev) => prev.filter((item) => item.id !== removedId));
        setRightItems((prev) => [...prev, itemToMove]);
      }

      return newAttachedIds;
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-indigo-700 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-indigo-600 rounded">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
          <button className="p-2 hover:bg-indigo-600 rounded">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded uppercase">
            Export Excel
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-red-500 text-white px-2 py-1 rounded uppercase">
            Critical
          </span>
          <button className="p-2 hover:bg-indigo-600 rounded">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Success message */}
      {saveSuccess && (
        <div className="bg-green-500 text-white p-4 text-center animate-fade-out">
          Save successful!
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-3/4 p-4 overflow-auto">
            <Droppable droppableId="leftTable">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white shadow rounded"
                >
                  <table className="w-full">
                    <thead className="bg-indigo-700 text-white">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-left">Id</th>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-center">Select</th>
                        <th className="p-2 text-center">Isolate</th>
                        <th className="p-2 text-left">Start Date</th>
                        <th className="p-2 text-left">End Date</th>
                        <th className="p-2 text-left">Predecessors N.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leftItems.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="border-b hover:bg-gray-100"
                            >
                              <td className="p-2">{index + 1}</td>
                              <td className="p-2">{item.id}</td>
                              <td className="p-2">{item.description}</td>
                              <td className="p-2 text-center">
                                <input type="checkbox" />
                              </td>
                              <td className="p-2 text-center">
                                <button className="text-gray-600 hover:text-gray-800">
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </button>
                              </td>
                              <td className="p-2">07/11/23</td>
                              <td className="p-2">17/12/25</td>
                              <td className="p-2">-</td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                </div>
              )}
            </Droppable>
          </div>
          <div className="w-1/4 bg-gray-100 p-4 overflow-auto">
            <Droppable droppableId="rightTable">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white shadow rounded"
                >
                  <table className="w-full">
                    <thead className="bg-indigo-700 text-white">
                      <tr>
                        <th className="p-2 text-left">Id</th>
                        <th className="p-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rightItems.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="border-b hover:bg-gray-100"
                            >
                              <td className="p-2">{item.id}</td>
                              <td className="p-2">{item.description}</td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                </div>
              )}
            </Droppable>
          </div>
        </div>
        {attachedIds.length > 0 && (
          <div
            style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f0f0',
            }}
          >
            <h3>Attached IDs:</h3>
            {attachedIds.map((id, index) => (
              <div key={index}>
                {id}{' '}
                <button
                  onClick={() => handleUndo(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleSave}
          style={{ marginTop: '10px' }}
          className="bg-indigo-500 text-white"
        >
          Save
        </button>
      </DragDropContext>
    </div>
  );
};

export default DragDropComponent;
