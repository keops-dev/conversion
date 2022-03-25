import React, { useState } from "react"
import { useEffect } from "react"
import {
    Container,
    DropdownButton,
    Form,
    InputGroup,
    Dropdown,
} from "react-bootstrap"
import * as ReactDOM from "react-dom"
import useDimensions from "./hooks/useDimensions"
import units from "./units"

function App() {
    const [firstFieldUnit, setFirstFieldUnit] = useState("inch")
    const [secondFieldUnit, setSecondFieldUnit] = useState("milimeter")
    const [firstFieldValue, setFirstFieldValue] = useState(0)
    const [secondFieldValue, setSecondFieldValue] = useState(0)
    const dimensions = useDimensions()

    const roundNumber = (number) =>
        Math.round((number + Number.EPSILON) * 100) / 100

    const handleFirstUnitChange = (key) => {
        setFirstFieldUnit(key)
        setSecondFieldValue(
            roundNumber(firstFieldValue * units[key]["to"][secondFieldUnit])
        )
    }

    const handleSecondUnitChange = (key) => {
        setSecondFieldUnit(key)
        setFirstFieldValue(
            roundNumber(secondFieldValue * units[key]["to"][firstFieldUnit])
        )
    }

    const handleFirstValueChange = (event) => {
        const value = event.target.value
        setFirstFieldValue(value)
        setSecondFieldValue(
            roundNumber(value * units[firstFieldUnit]["to"][secondFieldUnit])
        )
    }

    const handleSecondValueChange = (event) => {
        const value = event.target.value
        setSecondFieldValue(value)
        setFirstFieldValue(
            roundNumber(value * units[secondFieldUnit]["to"][firstFieldUnit])
        )
    }

    // Mets à jour la hauteur max des dropdown-menu pour ne pas qu'il dépasse
    // les limites de la fenêtre
    useEffect(() => {
        const dropdownMenus = document.getElementsByClassName("dropdown-menu")
        for (let dropdown of dropdownMenus) {
            const parentBounds = dropdown.parentElement.getBoundingClientRect()
            const { bottom: parentBottom, height: parentHeight } = parentBounds
            const height = parentBottom - parentHeight - 16
            dropdown.style.maxHeight = `${height}px`
        }
    }, [dimensions])

    useEffect(() => {
        console.log(window.api.ipcRenderer)
        window.api.onHiddenWindow(() => {
            setFirstFieldValue(0)
            setSecondFieldValue(0)
        })
    })

    const firstFieldUnitTitle = units[firstFieldUnit].name
    const secondFieldUnitTitle = units[secondFieldUnit].name

    return (
        <Container className="d-flex flex-column flex-grow-1 pt-3 overflow-hidden bg-light">
            <h1 className="text-center display-1 m-0">Conversion!</h1>
            <small className="text-muted align-self-center">
                a simple unit converter
            </small>
            <Container className="mt-auto">
                <InputGroup className="my-3">
                    <DropdownButton
                        variant="outline-primary"
                        title={firstFieldUnitTitle}
                        drop="up"
                        size="sm"
                        style={{ height: 80 }}
                    >
                        {Object.keys(units).map((key) => (
                            <Dropdown.Item
                                key={key}
                                onClick={() => handleFirstUnitChange(key)}
                            >
                                {units[key].name}
                            </Dropdown.Item>
                        ))}
                    </DropdownButton>
                    <Form.Control
                        value={firstFieldValue}
                        onChange={handleFirstValueChange}
                    />
                </InputGroup>
                <InputGroup className="my-3">
                    <DropdownButton
                        variant="outline-primary"
                        drop="up"
                        size="sm"
                        title={secondFieldUnitTitle}
                    >
                        {Object.keys(units).map((key) => (
                            <Dropdown.Item
                                key={key}
                                onClick={() => handleSecondUnitChange(key)}
                            >
                                {units[key].name}
                            </Dropdown.Item>
                        ))}
                    </DropdownButton>
                    <Form.Control
                        value={secondFieldValue}
                        onChange={handleSecondValueChange}
                    />
                </InputGroup>
            </Container>
        </Container>
    )
}

function render() {
    ReactDOM.render(<App />, document.getElementById("root"))
}

render()
