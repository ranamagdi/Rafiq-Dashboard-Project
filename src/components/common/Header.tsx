import {IMAGES} from "../../assets/index";
const Header = () => {
  return (

<header >
  <nav aria-label="Global" className="mx-auto flex items-center justify-between p-6 ">
    <div className="flex lg:flex-1">
      <a href="#" >
      
        <img src={IMAGES.logo} alt="Your Company" className="h-8 w-auto" />
      </a>
    </div>
 
   
  </nav>

</header>
    )


}

export default Header;