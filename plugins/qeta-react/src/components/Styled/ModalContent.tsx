import { styled } from '@mui/system';

export const ModalContent = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '20%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.action.selected}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  '& button': {
    marginTop: theme.spacing(2),
    float: 'right',
  },
}));