import * as React from 'react'

export interface IProps {
    filter: any
    onChange: (arg: any) => void
    dataKey: string
}

class FilterInput extends React.Component<IProps> {
    constructor(props) {
        super(props)
    }

    render() {
        const { dataKey, filter, onChange } = this.props

        return (
            <input
                type='checkbox'
                data-key={dataKey}
                data-title={filter.title}
                data-tag={filter.tag}
                name={`filter_${filter.tag}`}
                id={filter.tag}
                onChange={onChange}
                value={filter.tag}
                defaultChecked={filter.checked}
            />
        )
    }
}

export default FilterInput
