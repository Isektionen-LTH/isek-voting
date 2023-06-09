import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import './Menu.css';

const Menu = (props) => {
    const [open, setOpen] = useState(false);

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setOpen(open);
    };

    const handleMenuItemClick = () => {
        setOpen(false);
      };

      const list = () => (
        <Box
          sx={{
            width: 250
          }}
          role="presentation"
          onKeyDown={toggleDrawer(false)}
        >
          <List style={{ color: 'white' }}>
            <ListItem key="add-voting-code" disablePadding>
              <ListItemButton onClick={() => { props.menuFunctions.setAddVoterDialogOpen(true); handleMenuItemClick(); }}>
                <ListItemText primary="Lägg till valkod" />
              </ListItemButton>
            </ListItem>
            <ListItem key="remove-voting-code" disablePadding>
              <ListItemButton onClick={() => { props.menuFunctions.setRemoveVoterDialogOpen(true); handleMenuItemClick(); }}>
                <ListItemText primary="Ta bort valkod" />
              </ListItemButton>
            </ListItem>
            <ListItem key="show-all-voting-codes" disablePadding>
              <ListItemButton onClick={() => { props.menuFunctions.getAllVoters(); handleMenuItemClick(); }}>
                <ListItemText primary="Visa alla valkoder" />
              </ListItemButton>
            </ListItem>
            <ListItem key="remove-all-voting-codes" disablePadding>
              <ListItemButton onClick={() => { props.menuFunctions.setRemoveAllDialogOpen(true); handleMenuItemClick(); }}>
                <ListItemText primary="Ta bort alla valkoder" />
              </ListItemButton>
            </ListItem>
            <ListItem key="voting-codes-board" disablePadding>
              <ListItemButton onClick={() => { props.menuFunctions.setPermanentDialogOpen(true); handleMenuItemClick(); }}>
                <ListItemText primary="Valkoder styrelse" />
              </ListItemButton>
            </ListItem>
            <Divider style={{ background: 'white' }} />
            <ListItem key="send-voting-codes" disablePadding>
              <ListItemButton onClick={() => { props.menuFunctions.setSendAllRemailsDialogOpen(true); handleMenuItemClick(); }}>
                <ListItemText primary="Skicka valkoder" />
              </ListItemButton>
            </ListItem>
            <ListItem key="send-single-voting-code" disablePadding>
              <ListItemButton onClick={() => { props.menuFunctions.setSendSingleEmailDialogOpen(true); handleMenuItemClick(); }}>
                <ListItemText primary="Skicka en valkod" />
              </ListItemButton>
            </ListItem>
            <Divider style={{ background: 'white' }} />
            <ListItem key="change-password" disablePadding>
              <ListItemButton onClick={() => { props.menuFunctions.setResetPasswordDialogOpen(true); handleMenuItemClick(); }}>
                <ListItemText primary="Ändra lösenord" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      );
      
    return (
        <div>
            <div className='container'>
                <Button variant="contained" className='MenuButton' onClick={toggleDrawer(true)}>
                    <MenuIcon style={{ color: 'white' }} />
                </Button>
            </div>
            <Drawer
                anchor="right"
                open={open}
                onClose={toggleDrawer(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: '#70002D',
                    },
                    '& .MuiDrawer-paperAnchorDockedRight': {
                        borderLeft: 'none',
                    },
                }}
            >
                {list()}
            </Drawer>
        </div>
    );
}

export default Menu;
