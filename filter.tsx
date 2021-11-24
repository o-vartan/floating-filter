import * as React from 'react'
import bind from 'bind-decorator'
import FilterInput from './filter-Input'

export interface IProps {
    tags: string[]
    collectionUrl: string
    shopUrl: string
    currentTags: string[]
    filterPriceMin: number
    filterPriceMax: number
}

export interface IState {
    isFilterShown: boolean
    checkboxCount: number
    filters: {}
    filterUrl: string
    minPriceRangeValue: number
    maxPriceRangeValue: number
    priceRangeStep: number
    firstPriceRangeValue: number
    secondPriceRangeValue: number
}

class Filter extends React.Component<IProps, IState> {
    constructor(props) {
        super(props)
        this.state = {
            isFilterShown: false,
            checkboxCount: 0,
            filters: {},
            filterUrl: '',
            minPriceRangeValue: 0,
            maxPriceRangeValue: 600,
            priceRangeStep: 200,
            firstPriceRangeValue: null,
            secondPriceRangeValue: null,
        }
        this.handleFilterCheck = this.handleFilterCheck.bind(this)
    }

    componentDidMount() {
        this.setState({
            filters: this.transformTagsToFilterStructure(),
        })
        this.rangePriceStatement()
        setTimeout(() => this.currentTagsChkStatement(), 0)
        document.querySelector('#filter__btn').addEventListener('click', this.showFilter)
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideFilter()
            }
        })
    }

    transformTagsToFilterStructure() {
        const filterTags = ['gender', 'target-face', 'frame-shape', 'color', 'brand', 'type', 'size', 'vto']
        const allTagsFilter = {}
        this.props.tags.map((tag) => {
            const key = tag.slice(0, tag.indexOf('_'))
            const value = tag.slice(tag.indexOf('_') + 1)
            if (filterTags.indexOf(key) !== -1) {
                const title = value.replace('-', ' ')
                const category = key
                const checked = false
                const filter = {
                    tag,
                    title,
                    category,
                    checked,
                }
                if (!allTagsFilter[key]) {
                    allTagsFilter[key] = []
                }

                allTagsFilter[key].push(filter)
            }
        })
        return allTagsFilter
    }

    checkboxStringBuilder() {
        const newFilters = { ...this.state.filters }
        let checkboxesChk = []
        let checkboxesChkTagUrl = ''
        for (const key in newFilters) {
            const tag = newFilters[key].find(filter => filter.checked)
            if (tag) {
                checkboxesChk.push(tag.tag)
            }
        }
        checkboxesChk = checkboxesChk.filter(tag => tag != null)
        checkboxesChkTagUrl = checkboxesChk
            .join('+')
            .toString()
            .toLowerCase()
        this.setState({
            checkboxCount: checkboxesChk.length,
            filterUrl: checkboxesChkTagUrl,
        })
    }

    handleFilterCheck = (event) => {
        const key = event.target.dataset.key
        const title = event.target.dataset.title
        const newFilters = { ...this.state.filters }
        newFilters[key].forEach((filter) => {
            if (filter.title === title && filter.checked === true) {
                filter.checked = !filter.checked
                return
            }
            filter.checked = false
            if (filter.title === title && filter.checked === false) {
                filter.checked = !filter.checked
            }
        })
        this.setState({
            filters: newFilters,
        })
        this.checkboxStringBuilder()
    }

    @bind
    currentTagsChkStatement() {
        const currentTags = [...this.props.currentTags]
        const newFilters = { ...this.state.filters }

        for (const key in newFilters) {
            newFilters[key].forEach((filter) => {
                if (currentTags.includes(filter.tag)) {
                    filter.checked = true
                }
            })
        }
        this.setState({
            filters: newFilters,
            checkboxCount: currentTags.length,
        })
        this.checkboxStringBuilder()
    }

    @bind
    resetFilter() {
        const newFilters = { ...this.state.filters }
        for (const key in newFilters) {
            newFilters[key].forEach((filter) => {
                filter.checked = false
            })
        }
        this.setState({
            filters: newFilters,
            checkboxCount: 0,
            filterUrl: '',
            firstPriceRangeValue: this.state.minPriceRangeValue,
            secondPriceRangeValue: this.state.maxPriceRangeValue,
        })
    }

    @bind
    rangePriceStatement() {
        const { filterPriceMin, filterPriceMax } = this.props
        this.setState({
            firstPriceRangeValue: filterPriceMin || this.state.minPriceRangeValue,
            secondPriceRangeValue: filterPriceMax || this.state.maxPriceRangeValue,
        })
    }

    @bind
    handleChangeRange(name, event) {
        const value = Number(event.target.value)
        if (name === 'second' && this.state.firstPriceRangeValue < value) {
            this.setState({ secondPriceRangeValue: value })
        } else if (value < this.state.secondPriceRangeValue) {
            this.setState({ firstPriceRangeValue: value })
        }
    }

    @bind
    showFilter() {
        this.setState({
            isFilterShown: true,
        })
    }

    @bind
    hideFilter() {
        this.setState({
            isFilterShown: false,
        })
    }

    render() {
        const {
            firstPriceRangeValue,
            secondPriceRangeValue,
            minPriceRangeValue,
            maxPriceRangeValue,
            checkboxCount,
            priceRangeStep,
        } = this.state
        const { shopUrl, collectionUrl } = this.props

        let firstRangeValueUrl = `?filter.v.price.gte=${firstPriceRangeValue}`
        let secondRangeValueUrl = `&filter.v.price.lte=${secondPriceRangeValue}`
        if (firstPriceRangeValue === minPriceRangeValue && secondPriceRangeValue === maxPriceRangeValue) {
            firstRangeValueUrl = ''
            secondRangeValueUrl = ''
        }
        if (secondPriceRangeValue === maxPriceRangeValue) {
            secondRangeValueUrl = ''
        }
        const rangeUrl = `${firstRangeValueUrl}${secondRangeValueUrl}`
        const fullFilterUrl = `${shopUrl}/${collectionUrl}/${this.state.filterUrl}${rangeUrl}`

        return (
            <>
                {this.state.isFilterShown && (
                        <div className='filter'>
                        <div className='filter__background'/>
                            <div className='filter__header'>
                                <button onClick={this.resetFilter}>Reset</button>
                                <button onClick={this.hideFilter}>
                                    <span className='icon-close' />
                                </button>
                            </div>
                            <div className='filter__count'>
                                Filter {this.state.checkboxCount ? `(${this.state.checkboxCount})` : null}
                            </div>
                            <ul className='filter__list'>
                                {Object.keys(this.state.filters).map((key) => {
                                    const titleCategoty =
                                        key.charAt(0).toUpperCase() + key.substring(1).replace(/-/g, ' ')
                                    if (this.state.filters[key][0]) {
                                        return (
                                            <li key={key} className={key.toString() === 'vto' ? `vto` : ''}>
                                                <span>
                                                    {titleCategoty === 'Vto' ? 'Virtual try on' : titleCategoty}
                                                </span>
                                                <ul>
                                                    {this.state.filters[key].map((filter) => {
                                                        switch (filter.category) {
                                                            case 'vto':
                                                                return (
                                                                    <li
                                                                        key={`filter-${filter.tag}`}
                                                                        className='filter__switch'
                                                                    >
                                                                        <label
                                                                            className='filter__switch-checkbox'
                                                                            htmlFor={filter.tag}
                                                                        >
                                                                            <FilterInput
                                                                                dataKey={key}
                                                                                filter={filter}
                                                                                onChange={this.handleFilterCheck}
                                                                            />
                                                                            <div className='filter__switch-slider' />
                                                                        </label>
                                                                    </li>
                                                                )
                                                            case 'color':
                                                                const filterStyle: {} = {
                                                                    backgroundColor: filter.title,
                                                                    color: filter.title,
                                                                }
                                                                return (
                                                                    <li key={`filter-${filter.tag}`}>
                                                                        <button
                                                                            className={`${filter.checked ? 'filter__active' : ''
                                                                                } filter__button`}
                                                                            data-key={key}
                                                                            data-title={filter.title}
                                                                            data-tag={filter.tag}
                                                                            id={filter.tag}
                                                                            onClick={this.handleFilterCheck}
                                                                            defaultChecked={filter.checked}
                                                                        >
                                                                            <span
                                                                                className={`filter__button-color filter__button-${key}-${filter.title}`}
                                                                                style={filterStyle}
                                                                            />
                                                                            {filter.title}
                                                                        </button>
                                                                    </li>
                                                                )
                                                            default:
                                                                return (
                                                                    <li key={`filter-${filter.tag}`}>
                                                                        <button
                                                                            className={`${filter.checked ? 'filter__active' : ''
                                                                                } filter__button`}
                                                                            data-key={key}
                                                                            data-title={filter.title}
                                                                            data-tag={filter.tag}
                                                                            id={filter.tag}
                                                                            onClick={this.handleFilterCheck}
                                                                            defaultChecked={filter.checked}
                                                                        >
                                                                            <span
                                                                                className={`filter__button-${key}-${filter.title}`}
                                                                            />
                                                                            {filter.title}
                                                                        </button>
                                                                    </li>
                                                                )
                                                        }
                                                    })}
                                                </ul>
                                            </li>
                                        )
                                    }
                                })}
                            </ul>
                            <section className='filter__range-slider'>
                                <div className='filter__range-slider_title'>Range</div>
                                <input
                                    type='range'
                                    value={firstPriceRangeValue}
                                    min={minPriceRangeValue}
                                    max={maxPriceRangeValue}
                                    step={priceRangeStep}
                                    onChange={this.handleChangeRange.bind(this, 'first')}
                                />
                                <input
                                    type='range'
                                    value={secondPriceRangeValue}
                                    min={minPriceRangeValue}
                                    max={maxPriceRangeValue}
                                    step={priceRangeStep}
                                    onChange={this.handleChangeRange.bind(this, 'second')}
                                />
                                <div className='filter__range-slider_price-trek'>
                                    <span>$0</span>
                                    <span>$200</span>
                                    <span>$400</span>
                                    <span>$600+</span>
                                </div>
                            </section>
                            <a href={fullFilterUrl} className='button'>
                                Apply filter ({checkboxCount})
                            </a>
                        </div>
                )}
            </>
        )
    }
}

export default Filter
