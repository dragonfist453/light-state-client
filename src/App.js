import React, { useEffect, useState } from "react";
import { Box, Clock, Grommet, Stack, Diagram, Text } from "grommet";
import { RadialSelected, Trigger, EmptyCircle, Power } from "grommet-icons";
import _ from "lodash";
import axios from "axios";
import { hostname } from "./constants";

const theme = {
  global: {
    font: {
      family: "Roboto",
      size: "18px",
      height: "20px",
    },
    color: {
      background: "#222222",
      connection: "#7DF9FF",
      noConnection: "#FFFFFF",
    },
  },
};

const powerToHall = {
  fromTarget: "powerSource",
  toTarget: "powerHall",
  thickness: "xxsmall",
  anchor: "vertical",
  type: "rectilinear",
  color: theme.global.color.connection,
};

const powerToRoom = {
  fromTarget: "powerSource",
  toTarget: "powerRoom",
  thickness: "xxsmall",
  anchor: "vertical",
  type: "rectilinear",
  color: theme.global.color.connection,
};

const connNumbers = {
  hallCorner: 4,
  hallShortEdge: 2,
  hallLongEdge: 4,
  hallSmallLight: 2,
  roomLight: 4,
};

const getConnectionsByCollection = (collName) => {
  if (collName === "off") {
    return [];
  } else {
    let connections = [];
    for (let i = 1; i <= connNumbers[collName]; i++) {
      let anchor = "horizontal";
      let fromTarget = "powerHall";
      if (collName === "hallShortEdge") {
        anchor = "vertical";
      } else {
        anchor = "horizontal";
      }
      if (collName === "roomLight") {
        fromTarget = "powerRoom";
      } else {
        fromTarget = "powerHall";
      }
      connections.push({
        fromTarget: fromTarget,
        toTarget: collName + i,
        thickness: "xxsmall",
        anchor: anchor,
        type: "rectilinear",
        color: theme.global.color.connection,
      });
    }
    return connections;
  }
};

const connectionSettings = {
  off: [],
  hallCorner: ["hallCorner"],
  hallShortEdge: ["hallShortEdge"],
  hallLongEdge: ["hallLongEdge"],
  hallSmallLight: ["hallSmallLight"],
  roomLight: ["roomLight"],
  hallOn: ["hallCorner", "hallShortEdge", "hallLongEdge", "hallSmallLight"],
  roomOn: ["roomLight"],
  on: [
    "hallCorner",
    "hallShortEdge",
    "hallLongEdge",
    "hallSmallLight",
    "roomLight",
  ],
};

const getConnectionsBySettings = (lightSettings) => {
  let connections = [];
  for (let collection of lightSettings) {
    connections = connections.concat(getConnectionsByCollection(collection));
  }
  if (connections.length) {
    if ((lightSettings.length === 1 && lightSettings.includes("roomLight"))) {
      connections.push(powerToRoom);
    } else {
      connections.push(powerToHall);
    }
  }
  return connections;
};

const getSettingByID = (id) => {
  return id.replace(/[0-9]/g, "");
};

function App() {
  const [lights, setLights] = useState([]);
  const [connections, setConnections] = useState(
    getConnectionsBySettings(lights)
  );
  useEffect(() => {
    let response = {};
    axios.get(hostname + 'all').then(res => {
      response = res;
    })
    lights.forEach(light => {
      response[light] = 'on';
    })
    axios.post(hostname + 'all', response);
  }, [lights]);
  const handleClick = (event) => {
    let setting;
    if (event.currentTarget.id !== "") {
      setting = getSettingByID(event.currentTarget.id);
    } else if (event.target.id !== "") {
      setting = getSettingByID(event.target.id);
    } else {
      return;
    }
    let lightSettings = connectionSettings[setting];
    let newLights = lights;
    let newConns = connections;
    if (newLights.some((value) => lightSettings.indexOf(value) !== -1)) {
      newLights = newLights.filter(
        (value) => lightSettings.indexOf(value) === -1
      );
      newConns = newConns.filter(
        (obj1) =>
          !getConnectionsBySettings(lightSettings).some((obj2) =>
            _.isEqual(obj1, obj2)
          )
      );
    } else {
      newLights = newLights.concat(lightSettings);
      newConns = newConns.concat(getConnectionsBySettings(lightSettings));
    }
    setLights(newLights);
    setConnections(newConns);
  };
  return (
    <Grommet
      theme={theme}
      background={theme.global.color.background}
      full={true}
    >
      <Box gap="large" pad="10px">
        <Box align="center" gap="medium">
          <Clock type="digital" />
        </Box>
      </Box>
      <Box
        fill="vertical"
        overflow="auto"
        align="center"
        flex="grow"
        pad="large"
        background={{ color: theme.global.color.background }}
      >
        <Stack fill>
          <Diagram connections={connections} />
          <Box align="center" justify="center" gap="none" direction="column">
            <Box
              id="powerSource"
              align="center"
              justify="center"
              direction="column"
              pad="medium"
              responsive={false}
              wrap={false}
              round="large"
              border={{ color: theme.global.color.connection }}
            >
              <Trigger id="on" onClick={handleClick} color={theme.global.color.connection} size="large" />
            </Box>
            <Box
              align="center"
              justify="center"
              direction="row"
              pad="medium"
              gap="xlarge"
            >
              <Box
                align="center"
                justify="center"
                pad="xsmall"
                direction="column"
                gap="none"
                width="large"
              >
                <Box align="center" justify="center" direction="column">
                  <Box
                    align="center"
                    justify="center"
                    pad="small"
                    direction="row"
                    gap="medium"
                  >
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="hallCorner1"
                        size="medium"
                        color={lights.includes('hallCorner')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="hallShortEdge1"
                        size="medium"
                        color={lights.includes('hallShortEdge')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="hallCorner2"
                        size="medium"
                        color={lights.includes('hallCorner')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                  </Box>
                  <Box
                    align="center"
                    justify="center"
                    direction="row"
                    pad="small"
                    gap="xlarge"
                  >
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="hallLongEdge1"
                        size="medium"
                        color={lights.includes('hallLongEdge')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="hallLongEdge2"
                        size="medium"
                        color={lights.includes('hallLongEdge')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                  </Box>
                  <Box
                    align="center"
                    justify="center"
                    direction="row"
                    pad="small"
                    gap="medium"
                  >
                    <Box align="center" justify="center" pad="small">
                      <EmptyCircle
                        id="hallSmallLight1"
                        size="medium"
                        color={lights.includes('hallSmallLight')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                    <Box
                      align="center"
                      justify="center"
                      pad="small"
                      round="large"
                      border={{ color: theme.global.color.connection }}
                      id="powerHall"
                    >
                      <Power
                        color={theme.global.color.connection}
                        id="hallOn"
                        onClick={handleClick}
                      />
                    </Box>
                    <Box align="center" justify="center" pad="small">
                      <EmptyCircle
                        id="hallSmallLight2"
                        size="medium"
                        color={lights.includes('hallSmallLight')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                  </Box>
                  <Box
                    align="center"
                    justify="center"
                    direction="row"
                    pad="small"
                    gap="xlarge"
                  >
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="hallLongEdge3"
                        size="medium"
                        color={lights.includes('hallLongEdge')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="hallLongEdge4"
                        size="medium"
                        color={lights.includes('hallLongEdge')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                  </Box>
                  <Box
                    align="center"
                    justify="center"
                    direction="row"
                    pad="small"
                    gap="medium"
                  >
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="hallCorner3"
                        size="medium"
                        color={lights.includes('hallCorner')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="hallShortEdge2"
                        size="medium"
                        color={lights.includes('hallShortEdge')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="hallCorner4"
                        size="medium"
                        color={lights.includes('hallCorner')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                  </Box>
                </Box>
                <Box
                  align="center"
                  justify="center"
                  pad="xsmall"
                  direction="column"
                >
                  <Text textAlign="center">Hall Lights</Text>
                </Box>
              </Box>
              <Box align="center" justify="center">
                <Box
                  align="center"
                  justify="center"
                  pad="small"
                  direction="column"
                  gap="small"
                  width="large"
                >
                  <Box
                    align="center"
                    justify="center"
                    direction="row"
                    pad="small"
                    gap="xlarge"
                  >
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="roomLight1"
                        size="large"
                        color={lights.includes('roomLight')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="roomLight2"
                        size="large"
                        color={lights.includes('roomLight')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                  </Box>
                  <Box
                    align="center"
                    justify="center"
                    pad="small"
                    round="large"
                    border={{ color: theme.global.color.connection }}
                    id="powerRoom"
                  >
                    <Power
                      color={theme.global.color.connection}
                      id="roomOn"
                      onClick={handleClick}
                    />
                  </Box>
                  <Box
                    align="center"
                    justify="center"
                    direction="row"
                    pad="small"
                    gap="xlarge"
                  >
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="roomLight3"
                        size="large"
                        color={lights.includes('roomLight')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                    <Box align="center" justify="center" pad="small">
                      <RadialSelected
                        id="roomLight4"
                        size="large"
                        color={lights.includes('roomLight')?theme.global.color.connection:theme.global.color.noConnection}
                        onClick={handleClick}
                      />
                    </Box>
                  </Box>
                </Box>
                <Box
                  align="center"
                  justify="center"
                  pad="xsmall"
                  direction="column"
                >
                  <Text textAlign="center">Room Lights</Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Grommet>
  );
}

export default App;
