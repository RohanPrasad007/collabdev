"use client"
import { useDialogs } from "../context/DialogsContext";
import { useMatrix } from "../context/matrixContext";
import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import { Link } from "react-router-dom";

const Echos = () => {
  const { toggleEchoDialog } = useDialogs();
  const { currentMatrixId } = useMatrix();
  const [echos, setEchos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEchoId, setActiveEchoId] = useState(null);
  const [toggleDropdown, setToggleDropdown] = useState(true);

  useEffect(() => {
    if (!currentMatrixId) {
      setLoading(false);
      setEchos([]);
      return;
    }

    // Reference to the current matrix
    const matrixRef = ref(database, `matrices/${currentMatrixId}`);

    const matrixUnsubscribe = onValue(matrixRef, (snapshot) => {
      if (snapshot.exists()) {
        const matrixData = snapshot.val();
        const echoIds = matrixData.echoes || [];

        if (echoIds.length === 0) {
          setEchos([]);
          setLoading(false);
          return;
        }

        // Create an array to store echo details
        const echoDetails = [];

        // Create a counter to track loaded echoes
        let loadedCount = 0;

        // Fetch each echo's details using its ID
        echoIds.forEach((echoId) => {
          const echoRef = ref(database, `echoes/${echoId}`);

          onValue(
            echoRef,
            (echoSnapshot) => {
              if (echoSnapshot.exists()) {
                const echoData = echoSnapshot.val();
                console.log("Echo data:", echoData); // Debug log

                echoDetails.push({
                  echo_id: echoId,
                  ...echoData,
                });
              }

              loadedCount++;

              // When all echoes are loaded, update state
              if (loadedCount === echoIds.length) {
                console.log("All echo details:", echoDetails); // Debug log
                setEchos(echoDetails);
                setLoading(false);

                // Set the first echo as active if none is selected
                if (echoDetails.length > 0 && !activeEchoId) {
                  setActiveEchoId(echoDetails[0].echo_id);
                }
              }
            },
            {
              onlyOnce: true,
            }
          );
        });
      } else {
        setEchos([]);
        setLoading(false);
      }
    });

    return () => {
      matrixUnsubscribe();
    };
  }, [currentMatrixId]);

  const handleEchoClick = (echoId) => {
    setActiveEchoId(echoId);
    // You might want to update a context or perform other actions when selecting an echo
  };

  const handleDropdown = () => {
    setToggleDropdown(!toggleDropdown);
  };

  return (
    <div>
      <div className="h-[60px] border-[#020222] border-b-2 flex justify-start gap-2 items-end px-2 py-1 mt-[40px]">
        <div className="flex items-center gap-8">
          <div className="mt-[10px] cursor-pointer">
            <img src="/dropdown.svg" alt="Dropdown" onClick={handleDropdown} />
          </div>
          <div className="text-[24px] text-[#000000] font-medium">Echoes</div>
          <div>
            <img
              src="/plus.svg"
              onClick={toggleEchoDialog}
              className="cursor-pointer"
              alt="Add Echo"
            />
          </div>
        </div>
      </div>

      {!toggleDropdown ? (
        ""
      ) : (
        <div className="flex items-end justify-center py-1 mt-[15px]">
          <div className="flex flex-col gap-2">
            {echos.length > 0
              ? echos.map((echo) => (
                <Link
                  key={echo.echo_id}
                  to={`/echo/${echo.echo_id}`}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => handleEchoClick(echo.echo_id)}
                >
                  <div>
                    <img src="/voiceIcon.svg" alt="Voice Icon" />
                  </div>
                  <div className="text-[20px] text-[#000000] font-medium">
                    {echo.name ||
                      `Voice-ch-${echo.echo_id?.substring(5, 9) || "default"
                      }`}
                  </div>
                  {activeEchoId === echo.echo_id && (
                    <div>
                      <img src="/activeText.svg" alt="Active" />
                    </div>
                  )}
                </Link>
              ))
              : ""}
          </div>
        </div>
      )}
    </div>
  );
};

export default Echos;
