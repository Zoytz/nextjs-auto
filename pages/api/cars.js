import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
   try {
       const client = await clientPromise;
       const db = client.db('hrTest');

       const cars = await db
           .collection('stock')
           .find({})
           .toArray();

       res.json(cars);
   } catch (e) {
       console.error(e);
   }
};