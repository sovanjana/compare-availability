import "./styles.css";
import {
  patientAvailability as pAvail,
  practitionerAvailability as cAvail,
  timezone
} from "./constant";
import momentTZ from "moment-timezone";
import { useEffect, useState } from "react";
import classnames from "classnames";

export default function App() {
  const duration = 30;

  const [slots, setSlots] = useState([]);
  const [pSlots, setPSlots] = useState([]);
  const [cSlots, setCSlots] = useState([]);

  useEffect(() => {
    const startTime = momentTZ(pAvail.start).isBefore(cAvail.start)
      ? pAvail.start
      : cAvail.start;
    const endTime = momentTZ(pAvail.end).isBefore(cAvail.end)
      ? cAvail.end
      : pAvail.end;

    const diff = momentTZ(endTime).diff(momentTZ(startTime), "minutes");
    let noOfSlots = diff / duration;
    const draft = getSlots(startTime, noOfSlots, duration);
    setSlots(draft);

    const pDiff = momentTZ(pAvail.end).diff(momentTZ(pAvail.start), "minutes");
    let pNoOfSlots = pDiff / duration;
    const pDraft = getSlots(pAvail.start, pNoOfSlots, duration);
    setPSlots(pDraft);

    const cDiff = momentTZ(cAvail.end).diff(momentTZ(cAvail.start), "minutes");
    let cNoOfSlots = cDiff / duration;
    const cDraft = getSlots(cAvail.start, cNoOfSlots, duration);
    setCSlots(cDraft);
  }, []);

  const modifiedData = getModifiedObj(slots, [pSlots, cSlots]);
  console.log({ modifiedData, slots, pSlots, cSlots });

  return (
    <div className="app">
      <div className="comparison">
        {modifiedData.map((obj) => {
          const slotEndAt = momentTZ(obj.slot.split(" - ")[1])
            .tz(timezone)
            .format("hh:mm A");

          return (
            <div className="slot-row" key={slotEndAt}>
              <div className="slot-label">
                <span>{slotEndAt}</span>
              </div>
              {obj.availability.map((x, i) => {
                let style = {};
                if (x[i]) {
                  style.backgroundColor = i === 1 ? "#4A24EA" : "#03D8D8";
                }
                return (
                  <div className="compare-with">
                    <span className="is-available" style={style} />
                    <div className="slot-inner-wrapper"></div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const getSlots = (startTime, noOfSlots, duration) => {
  const draft = [...new Array(noOfSlots)].map((_slotItem, i) => {
    const start = momentTZ(startTime)
      .add(duration * i, "m")
      .utc()
      .format();
    const end = momentTZ(startTime)
      .add(duration * (i + 1), "m")
      .utc()
      .format();
    return `${start} - ${end}`;
  });
  return draft;
};

const getModifiedObj = (slots, arr) => {
  const draft = slots.map((slot) => ({
    slot,
    availability: arr.map((obj, index) => ({
      [index]: obj.includes(slot)
    })),
    booking: arr.map((obj, index) => ({
      [index]: obj.includes(slot)
    }))
  }));
  return draft;
};
