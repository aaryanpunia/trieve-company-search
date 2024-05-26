import { SearchType, useCompaniesSearch } from "@/api/treive";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDebounce } from "@uidotdev/usehooks";
import Heading from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SubHeading from "@/components/ui/sub-heading";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import React from "react";

function CompanyDescription({ description }: { description: string }) {
  const parsedText = description.split(/<\/?[b|mark]>/);
  const highlightedText = parsedText.map((segment, index) => {
    segment = segment.replace(/<mark>/g, "").replace(/<\/mark>/g, "");
    segment = segment.replace(/<b>/g, "").replace(/<\/b>/g, "");
    if (index % 2 === 1) { 
      return (
        <mark key={index}>{segment}</mark>
      )
    }
    return <span key={index}>{segment}</span>;
  });
  return <p>{highlightedText}</p>;
}

function CompanyCard({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <CompanyDescription description={description} />
      </CardContent>
    </Card>
  );
}

function Home() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchType, setSearchType] = React.useState<SearchType>("semantic");
  const companies = useCompaniesSearch({
    searchQuery: debouncedSearchQuery,
    searchType,
  });
  return (
    <div className="p-12 min-h-screen bg-slate-50">
      <Heading>Trieve Search for Startups</Heading>
      <SubHeading>Explore startups!</SubHeading>
      <div className="relative ml-auto flex-1 md:grow-0 mt-5">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[400px] lg:w-[600px]"
        />
      </div>
      <Select
        onValueChange={(val) => {
          setSearchType(val as SearchType);
        }}
        defaultValue="semantic"
      >
        <SelectTrigger className="mt-3 w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semantic">Semantic</SelectItem>
          <SelectItem value="fulltext">FullText</SelectItem>
          <SelectItem value="hybrid">Hybrid</SelectItem>
        </SelectContent>
      </Select>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-5 gap-3">
        {companies.isSuccess &&
          companies.data &&
          companies.data.map((company) => (
            <CompanyCard key={company.name} {...company} />
          ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: () => <Home />,
});
