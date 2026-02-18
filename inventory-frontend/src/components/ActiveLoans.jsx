import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';



const ActiveLoans = () => {

const { user } = useAuth();
const [loans, setLoans] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [showReturnModal, setShowReturnModal] = useState(false);
const [selectedLoan, setSelectedLoan] = useState(null);
const [returnCondition, setReturnCondition] = useState(0);  // Default: Good
const [returnNotes, setReturnNotes] = useState('');



};export default ActiveLoans;