/*
  # Create credit transactions system

  1. New Tables
    - `credit_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `action_type` (text)
      - `credits_deducted` (integer)
      - `credits_before` (integer)
      - `credits_after` (integer)
      - `transaction_id` (text, unique)
      - `metadata` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `credit_transactions` table
    - Add policies for users to read their own transactions

  3. Indexes
    - Add performance indexes for common queries
*/

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL,
  credits_deducted integer NOT NULL CHECK (credits_deducted >= 0),
  credits_before integer NOT NULL CHECK (credits_before >= 0),
  credits_after integer NOT NULL CHECK (credits_after >= 0),
  transaction_id text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS only if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'credit_transactions' 
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policy only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'credit_transactions' 
    AND policyname = 'Users can read own credit transactions'
  ) THEN
    CREATE POLICY "Users can read own credit transactions"
      ON credit_transactions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_transaction_id ON credit_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_action_type ON credit_transactions(action_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Add unique constraint for transaction_id only if it doesn't exist
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_constraint 
--     WHERE conname = 'credit_transactions_transaction_id_key'
--   ) THEN
--     ALTER TABLE credit_transactions ADD CONSTRAINT credit_transactions_transaction_id_key UNIQUE (transaction_id);
--   END IF;
-- END $$;