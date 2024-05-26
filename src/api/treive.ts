import { useQuery } from "@tanstack/react-query";

const API_KEY = import.meta.env.VITE_TRIEVE_API_KEY;
const DB_ID = import.meta.env.VITE_TRIEVE_DB_ID;

type SearchType = "semantic" | "fulltext" | "hybrid";

type Company = {
  name: string;
  description: string;
};

type TrieveSearchResponse = {
  score_chunks: {
    metadata: {
      chunk_html: string;
    }[];
    score: number;
  }[];
};

function parseHTMLChunk(chunk: string): Company {
  const [nameString, descriptionString] = chunk.split("<br>");

  const name = nameString.replace("Name: ", "").trim();
  const description = descriptionString.replace("Description: ", "").trim();

  return { name, description };
}

const useCompaniesSearch = ({
  searchQuery,
  searchType,
}: {
  searchQuery: string;
  searchType: SearchType;
}) => {
  const mutation = useQuery({
    queryFn: async () => {
      const response = await fetch("https://api.trieve.ai/api/chunk/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: API_KEY,
          "TR-Dataset": DB_ID,
        },
        body: JSON.stringify({
          highlight_delimiters: ["?", ",", ".", "!"],
          highlight_results: true,
          query: searchQuery,
          score_threshold: 0.5,
          search_type: searchType,
        }),
      });
      const data = (await response.json()) as TrieveSearchResponse;
      return data.score_chunks.map((chunk) =>
        parseHTMLChunk(chunk.metadata[0].chunk_html)
      );
    },
    queryKey: [searchQuery, searchType],
  });
  return mutation;
};

export { useCompaniesSearch };
export type { SearchType };
