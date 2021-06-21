import React, { Component } from 'react';
import Header from '../../common/header/Header';
import Typography from '@material-ui/core/Typography';
import { withStyles, CardContent } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import Card from '@material-ui/core/Card';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import Fade from '@material-ui/core/Fade';
import * as Utils from "../../common/Utils";
import * as Constants from "../../common/Constants";

import "../../assets/font-awesome-4.7.0/css/font-awesome.min.css";
import "./Details.css"

const styles = (theme => ({

  textRatingCost: {
    'text-overflow': 'clip',
    'width': '145px',
    'color': 'grey'
  },
  restaurantName: {
    'padding': '8px 0px 8px 0px',
    'font-size': '30px',
  },
  restaurantCategory: {
    'padding': '8px 0px 8px 0px'
  },
  avgCost: {
    'padding-left': '5px'
  },
  itemPrice: {
    'padding-left': '5px'
  },
  addButton: {
    'margin-left': '25px',
  },
  menuItemName: {
    'margin-left': '20px',
  },

  shoppingCart: {
    color: 'black',
    'background-color': 'white',
    width: '60px',
    height: '50px',
    'margin-left': '-20px',
    'z-index': 0,
  },
  cartHeader: {
    'padding-bottom': '0px',
    'margin-left': '10px',
    'margin-right': '10px'
  },
  cartItemButton: {
    padding: '10px',
    'border-radius': '0',
    color: '#fdd835',
    '&:hover': {
      'background-color': '#ffee58',
    }
  },
  cardContent: {
    'padding-top': '0px',
    'margin-left': '10px',
    'margin-right': '10px'
  },
  totalAmount: {
    'font-weight': 'bold'
  },
  checkOutButton: {
    'font-weight': '400'
  }
}))

class Details extends Component {
  constructor() {
    super()
    this.state = {
      restaurantDetails: null,
      categories: [],
      cartItems: [],
      totalAmount: 0,
      snackBarOpen: false,
      snackBarMessage: "",
      transition: Fade,
    }
  }

  componentDidMount() {
    let that = this;
    const requestUrl = this.props.baseUrl + 'restaurant/' + this.props.match.params.id;
    //Hit The Api with Util Method
    Utils.makeApiCall(
      requestUrl,
      null,
      null,
      Constants.ApiRequestTypeEnum.GET,
      null,
      responseText => {
        let categoriesName = [];
        let data = JSON.parse(responseText);
        data.categories.forEach(category => {
          //Prepare Category Name Array
          categoriesName.push(category.category_name);
        });
        let restaurantDetails = {
          id: data.id,
          name: data.restaurant_name,
          photoURL: data.photo_URL,
          avgCost: data.average_price,
          rating: data.customer_rating,
          noOfCustomerRated: data.number_customers_rated,
          locality: data.address.locality,
          categoriesName: categoriesName.toString(),
        }
        let categories = data.categories;
        //Set State Data
        that.setState({
          restaurantDetails: restaurantDetails,
          categories: categories,
        });
      },
      ErrText => {
        //Handle any error
        console.log('Fetch Error :-S', ErrText);
      }
    );
  }

  //Add Item To Cart
  cartAddClickHandler = (item) => {
    let cartItems = this.state.cartItems;
    let itemPresentInCart = false;

    //Check if item is already in the Cart
    cartItems.forEach(cartItem => {
      if (cartItem.id === item.id) {
        //Update Quantity and Totals
        itemPresentInCart = true;
        cartItem.quantity++;
        cartItem.totalAmount = cartItem.price * cartItem.quantity;
      }
    })

    //Not Found Add New item to Array
    if (!itemPresentInCart) {
      let cartItem = {
        id: item.id,
        name: item.item_name,
        price: item.price,
        totalAmount: item.price,
        quantity: 1,
        itemType: item.item_type,
      }
      cartItems.push(cartItem);
    }
    //updating the total amount for the cart.
    let totalAmount = 0;
    cartItems.forEach(cartItem => {
      totalAmount = totalAmount + cartItem.totalAmount;
    })

    //Updating the state.
    this.setState({
      cartItems: cartItems,
      snackBarOpen: true,
      snackBarMessage: "Item added to cart!",
      totalAmount: totalAmount,

    })
  }

  //Remove Item From Cart
  cartRemoveClickHandler = (item) => {
    let cartItems = this.state.cartItems;
    //Get item index from current cart
    let index = cartItems.indexOf(item);
    let itemRemoved = false;
    //Reduce the quantity
    cartItems[index].quantity--;

    //if quantity is zero remove it from car array
    if (cartItems[index].quantity === 0) {
      cartItems.splice(index, 1);
      itemRemoved = true;
    } else {
      //Update the item total ammmount
      cartItems[index].totalAmount = cartItems[index].price * cartItems[index].quantity; //Updating the Price of the item
    }

    //Update Cart Totals
    let totalAmount = 0;
    cartItems.forEach(cartItem => {
      totalAmount = totalAmount + cartItem.totalAmount;
    })

    //Update the States with correct snack message
    this.setState({
      cartItems: cartItems,
      snackBarOpen: true,
      snackBarMessage: itemRemoved ? "Item removed from cart!" : "Item quantity decreased by 1!",
      totalAmount: totalAmount,
    })
  }

  //Handle Checkout and Redirect to Checkout Page
  checkOutButtonClickHandler = () => {
    let cartItems = this.state.cartItems;
    let isLoggedIn = sessionStorage.getItem("access-token") == null ? false : true;

    if (cartItems.length === 0) {
      //Check Item Length
      this.setState({
        snackBarOpen: true,
        snackBarMessage: "Please add an item to your cart!",
      })
    } else if (!isLoggedIn) {
      //Check Login
      this.setState({
        snackBarOpen: true,
        snackBarMessage: "Please login first!",
      })
    } else {
      //Send Cart and Resto Details to Checkout 
      this.props.history.push({
        pathname: '/checkout',
        cartItems: this.state.cartItems,
        restaurantDetails: this.state.restaurantDetails,
      })
    }
  }

  //Snack Notification Close
  snackBarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({
      snackBarMessage: "",
      snackBarOpen: false,
    })
  }

  //Logout Action Header
  logOutredirect = () => {
    sessionStorage.clear();
    this.props.history.push({
      pathname: "/"
    });
    window.location.reload();
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Header logoutHandler={this.logOutredirect} baseUrl={this.props.baseUrl} />
        {
          !Utils.isUndefinedOrNullOrEmpty(this.state.restaurantDetails) ?
            <React.Fragment>
              <div className="restaurant-details-container">
                <div>
                  <img src={this.state.restaurantDetails.photoURL} alt="Restaurant" height="215px" width="275px" />
                </div>
                <div className="restaurant-details">
                  <div className="restaurant-name">
                    <Typography variant="h5" component="h5" className={classes.restaurantName}>{this.state.restaurantDetails.name}</Typography>
                    <Typography variant="subtitle1" component="p" className={classes.restaurantLocation}>{this.state.restaurantDetails.locality}</Typography>
                    <Typography variant="subtitle1" component="p" className={classes.restaurantCategory}>{this.state.restaurantDetails.categoriesName}</Typography>
                  </div>
                  <div className="restaurant-rating-cost-container">
                    <div className="restaurant-rating-container">
                      <div className="restaurant-rating">
                        <i className="fa fa-star" ></i>
                        <Typography variant="subtitle1" component="p">{this.state.restaurantDetails.rating}</Typography>
                      </div>
                      <Typography variant="caption" component="p" className={classes.textRatingCost}  >AVERAGE RATING BY {<span className="restaurant-NoOfCustomerRated">{this.state.restaurantDetails.noOfCustomerRated}</span>} CUSTOMERS</Typography>
                    </div>
                    <div className="restaurant-avg-cost-container">
                      <div className="restaurant-avg-cost">
                        <i className="fa fa-inr" ></i>
                        <Typography variant="subtitle1" component="p" className={classes.avgCost}>{this.state.restaurantDetails.avgCost}</Typography>
                      </div>
                      <Typography variant="caption" component="p" className={classes.textRatingCost} >AVERAGE COST FOR TWO PEOPLE</Typography>
                    </div>
                  </div>
                </div>
              </div>
              <div className="menu-details-cart-container">
                <div className="menu-details">
                  {this.state.categories.map(category => (
                    <div key={category.id}>
                      <Typography variant="overline" component="p" className={classes.categoryName} >{category.category_name}</Typography>
                      <Divider />
                      {category.item_list.map(item => (
                        <div className='menu-item-container' key={item.id}>
                          <i className="fa fa-circle" style={{ color: item.item_type === "NON_VEG" ? "#BE4A47" : "#5A9A5B" }}></i>
                          <Typography variant="subtitle1" component="p" className={classes.menuItemName} >{item.item_name[0].toUpperCase() + item.item_name.slice(1)}</Typography>
                          <div className="item-price">
                            <i className="fa fa-inr"></i>
                            <Typography variant="subtitle1" component="p" className={classes.itemPrice} >{item.price.toFixed(2)}</Typography>
                          </div>
                          <IconButton className={classes.addButton} aria-label="add" onClick={() => this.cartAddClickHandler(item)}>
                            <AddIcon />
                          </IconButton>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="my-cart">
                  <Card className={classes.myCart}>
                    <CardHeader
                      avatar={
                        <Avatar aria-label="shopping-cart" className={classes.shoppingCart}>
                          <Badge badgeContent={this.state.cartItems.length} color="primary" showZero={true} className={classes.badge}>
                            <ShoppingCartIcon />
                          </Badge>
                        </Avatar>
                      }
                      title="My Cart"
                      titleTypographyProps={{
                        variant: 'h6'
                      }}
                      className={classes.cartHeader}
                    />
                    <CardContent className={classes.cardContent}>
                      {this.state.cartItems.map(cartItem => (
                        <div className="cart-menu-item-container" key={cartItem.id}>
                          <i className="fa fa-stop-circle-o" style={{ color: cartItem.itemType === "NON_VEG" ? "#BE4A47" : "#5A9A5B" }}></i>
                          <Typography variant="subtitle1" component="p" className={classes.menuItemName} id="cart-menu-item-name" >{cartItem.name[0].toUpperCase() + cartItem.name.slice(1)}</Typography>
                          <div className="quantity-container">
                            <IconButton className={classes.cartItemButton} id="minus-button" aria-label="remove" onClick={() => this.cartRemoveClickHandler(cartItem)} >
                              <i className="fa fa-minus" style={{ color: "black" }} ></i>
                            </IconButton>
                            <Typography variant="subtitle1" component="p" className={classes.itemQuantity}>{cartItem.quantity}</Typography>
                            <IconButton className={classes.cartItemButton} aria-label="add" onClick={() => this.cartAddClickHandler(cartItem)}>
                              <i className="fa fa-plus" style={{ color: "black" }}  ></i>
                            </IconButton>
                          </div>
                          <div className="item-price">
                            <i className="fa fa-inr" style={{ color: 'grey' }}></i>
                            <Typography variant="subtitle1" component="p" className={classes.itemPrice} id="cart-item-price">{cartItem.totalAmount.toFixed(2)}</Typography>
                          </div>
                        </div>
                      ))}
                      <div className="total-amount-container">
                        <Typography variant="subtitle2" component="p" className={classes.totalAmount}>TOTAL AMOUNT</Typography>
                        <div className="total-price">
                          <i className="fa fa-inr" ></i>
                          <Typography variant="subtitle1" component="p" className={classes.itemPrice} id="cart-total-price">{this.state.totalAmount.toFixed(2)}</Typography>
                        </div>
                      </div>
                      <Button variant="contained" color='primary' fullWidth={true} className={classes.checkOutButton} onClick={this.checkOutButtonClickHandler}>CHECKOUT</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <Snackbar
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                open={this.state.snackBarOpen}
                autoHideDuration={4000}
                onClose={this.snackBarClose}
                TransitionComponent={this.state.transition}
                ContentProps={{
                  'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">{this.state.snackBarMessage}</span>}
                action={
                  <IconButton color='inherit' onClick={this.snackBarClose}>
                    <CloseIcon />
                  </IconButton>
                }
              />
            </React.Fragment>
            :
            <Typography variant="subtitle1" component="p">No Data Found</Typography>
        }
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(Details);