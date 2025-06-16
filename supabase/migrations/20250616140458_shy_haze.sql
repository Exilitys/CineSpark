/*
  # Add INSERT policy for credit transactions

  1. Security
    - Add policy for authenticated users to insert their own credit transactions
    - Users can only insert transactions where user_id matches their auth.uid()
  
  2. Changes
    - Create INSERT policy for credit_transactions table
    - Allows authenticated users to log their own transactions
*/

CREATE POLICY "Users can insert own credit transactions"
  ON credit_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);