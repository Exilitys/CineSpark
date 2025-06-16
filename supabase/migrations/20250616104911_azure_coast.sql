/*
  # Create credit transactions table

  1. New Tables
    - `credit_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `action_type` (text, the type of action that consumed credits)
      - `credits_deducted` (integer, amount of credits deducted)
      - `credits_before` (integer, credit balance before transaction)
      - `credits_after` (integer, credit balance after transaction)
      - `transaction_id` (text, unique transaction identifier)
      - `metadata` (jsonb, additional transaction data)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `credit_transactions` table
    - Add policies for users to read their own transactions
    - Add indexes for better performance

  3. Constraints
    - Unique constraint on transaction_id
    - Check constraints for valid credit amounts
*/

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL,
  credits_deducted integer NOT NULL CHECK (credits_deducted >= 0),
  credits_before integer NOT NULL CHECK (credits_before >= 0),
  credits_after integer NOT NULL CHECK (credits_after >= 0),
  transaction_id text NOT NULL UNIQUE,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own credit transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_transaction_id ON credit_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_action_type ON credit_transactions(action_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Add constraint for unique transaction_id
ALTER TABLE credit_transactions ADD CONSTRAINT credit_transactions_transaction_id_key UNIQUE (transaction_id);