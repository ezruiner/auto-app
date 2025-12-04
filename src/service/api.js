


export async function getRecordCards()
{
    try {
        const res= await fetch("/data/Records.json")
        if (!res.ok) throw new Error("Network responce was not ok");
        const data=await res.json();
        return data ; 
    }
    
   
    catch (err)
    {
        console.error("ошибка загрузки json" , err)
        return []; 
    }

        
}