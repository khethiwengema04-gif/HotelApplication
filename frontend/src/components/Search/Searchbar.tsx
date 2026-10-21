import style from './Search.module.css'
import { Text } from '../text/text'
import SearchIcon from '../../assets/search-icon.png'

type Props = {
    onSearch: (query: string) => void
}
export const Searchbar: React.FC<Props> = ({ onSearch }) => {

    return (
        <div className={style['search-bar']}>
            <Text varient={'span'} style={{ color: 'rgb(20, 20, 20)', padding: 10 }}>Search</Text>
            <input type='text' onChange={(e) => onSearch(e.target.value)} className={style['search-input']} />
            {/* onChange={(e) => onSearch(e.target.value)} */}
            <img src={SearchIcon} alt='search icon on search bar' className={style['SearchIcon']} />

        </div>
    )
}
