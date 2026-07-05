import { useEffect, useMemo, useState } from "react";
import { useClient } from "sanity";
import {
  Box,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Text,
  Badge,
  Select,
  Button,
  Spinner,
} from "@sanity/ui";
import { TAXONOMY_TYPES } from "./registry";
import {
  fetchAllTaxonomyNodes,
  computeCoverage,
  computeCompleteness,
  detectMissingContentGaps,
  detectOrphanedAndUntagged,
  detectBrokenRelationships,
  computeSeoReadiness,
  buildRoadmap,
  computePublishReadiness,
  getRelatedDocuments,
  type FetchClient,
} from "./compute";
import type {
  TaxonomyNode,
  CoverageCounts,
  CompletenessBreakdown,
  ContentGap,
  SeoReadiness,
  RoadmapRecommendation,
  PublishReadinessResult,
  RoadmapRecommendation as Rec,
} from "./types";
import type { RelatedDocument } from "./compute";

const API_VERSION = "2024-01-01";

function editUrl(type: string, id: string) {
  return `/studio/intent/edit/id=${id};type=${type}`;
}

function scoreTone(score: number): "positive" | "caution" | "critical" {
  if (score >= 70) return "positive";
  if (score >= 40) return "caution";
  return "critical";
}

export function ContentIntelligenceTool() {
  const client = useClient({ apiVersion: API_VERSION }) as unknown as FetchClient;
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<TaxonomyNode[]>([]);
  const [coverageByNode, setCoverageByNode] = useState<Map<string, CoverageCounts>>(new Map());
  const [gaps, setGaps] = useState<ContentGap[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [relatedDocs, setRelatedDocs] = useState<RelatedDocument[] | null>(null);
  const [tab, setTab] = useState("coverage");
  const [pubA, setPubA] = useState<string>("");
  const [pubB, setPubB] = useState<string>("");
  const [publishResult, setPublishResult] = useState<PublishReadinessResult | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const allNodes = await fetchAllTaxonomyNodes(client);
      const coverageEntries = await Promise.all(
        allNodes.map(async (n) => [n.id, await computeCoverage(client, n)] as const)
      );
      const coverageMap = new Map(coverageEntries);

      const [missingGaps, orphanGaps, brokenGaps] = await Promise.all([
        Promise.all(allNodes.map((n) => detectMissingContentGaps(n, coverageMap.get(n.id)!))).then((g) => g.flat()),
        detectOrphanedAndUntagged(client),
        detectBrokenRelationships(client),
      ]);

      if (cancelled) return;
      setNodes(allNodes);
      setCoverageByNode(coverageMap);
      setGaps([...brokenGaps, ...missingGaps, ...orphanGaps]);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const completenessByNode = useMemo(() => {
    const map = new Map<string, CompletenessBreakdown>();
    for (const node of nodes) {
      const coverage = coverageByNode.get(node.id);
      if (coverage) map.set(node.id, computeCompleteness(node, coverage));
    }
    return map;
  }, [nodes, coverageByNode]);

  const seoByNode = useMemo(() => {
    const map = new Map<string, SeoReadiness>();
    for (const node of nodes) {
      const coverage = coverageByNode.get(node.id);
      if (coverage) map.set(node.id, computeSeoReadiness(node, coverage));
    }
    return map;
  }, [nodes, coverageByNode]);

  const roadmap: Rec[] = useMemo(() => buildRoadmap(nodes, coverageByNode), [nodes, coverageByNode]);

  async function openExplorer(node: TaxonomyNode) {
    setSelectedNodeId(node.id);
    setRelatedDocs(null);
    const docs = await getRelatedDocuments(client, node);
    setRelatedDocs(docs);
  }

  async function runPublishCheck() {
    if (!pubA || !pubB) return;
    setPublishLoading(true);
    const a = nodes.find((n) => n.id === pubA)!;
    const b = nodes.find((n) => n.id === pubB)!;
    const result = await computePublishReadiness(client, { id: a.id, name: a.name }, { id: b.id, name: b.name });
    setPublishResult(result);
    setPublishLoading(false);
  }

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: "100%" }}>
        <Spinner muted />
      </Flex>
    );
  }

  return (
    <Container width={4} padding={4}>
      <Stack space={4}>
        <Stack space={2}>
          <Heading size={3}>Content Intelligence Dashboard</Heading>
          <Text muted size={1}>
            Live report over the content graph — {nodes.length} taxonomy items across {TAXONOMY_TYPES.length} types.
          </Text>
        </Stack>

        <TabList space={2}>
          <Tab id="coverage-tab" aria-controls="coverage-panel" label="Coverage & Completeness" onClick={() => setTab("coverage")} selected={tab === "coverage"} />
          <Tab id="gaps-tab" aria-controls="gaps-panel" label="Missing Content" onClick={() => setTab("gaps")} selected={tab === "gaps"} />
          <Tab id="explorer-tab" aria-controls="explorer-panel" label="Relationship Explorer" onClick={() => setTab("explorer")} selected={tab === "explorer"} />
          <Tab id="seo-tab" aria-controls="seo-panel" label="SEO Readiness" onClick={() => setTab("seo")} selected={tab === "seo"} />
          <Tab id="roadmap-tab" aria-controls="roadmap-panel" label="Content Roadmap" onClick={() => setTab("roadmap")} selected={tab === "roadmap"} />
          <Tab id="publish-tab" aria-controls="publish-panel" label="Publish Readiness" onClick={() => setTab("publish")} selected={tab === "publish"} />
        </TabList>

        {tab === "coverage" && (
          <TabPanel id="coverage-panel" aria-labelledby="coverage-tab">
            <Stack space={4}>
              {TAXONOMY_TYPES.map((cfg) => {
                const group = nodes.filter((n) => n.type === cfg.type);
                if (group.length === 0) return null;
                return (
                  <Stack key={cfg.type} space={3}>
                    <Heading size={1}>{cfg.label}</Heading>
                    <Grid columns={[1, 2, 3]} gap={3}>
                      {group.map((node) => {
                        const coverage = coverageByNode.get(node.id);
                        const completeness = completenessByNode.get(node.id);
                        if (!coverage || !completeness) return null;
                        return (
                          <Card key={node.id} padding={3} radius={2} shadow={1} border>
                            <Stack space={3}>
                              <Flex align="center" justify="space-between">
                                <Text weight="semibold">{node.name}</Text>
                                <Badge tone={scoreTone(completeness.total)}>{completeness.total}/100</Badge>
                              </Flex>
                              <Stack space={2}>
                                <Text size={1}>Portfolio: {coverage.portfolioItem}</Text>
                                <Text size={1}>Testimonials: {coverage.testimonial}</Text>
                                <Text size={1}>Transformations: {coverage.transformation}</Text>
                                <Text size={1}>FAQs: {coverage.faq}</Text>
                                <Text size={1}>Blog posts: {coverage.blogPost}</Text>
                                {node.type !== "service" && <Text size={1}>Related services: {coverage.relatedServices}</Text>}
                                <Text size={1}>
                                  Internal links: {coverage.internalLinks === null ? "n/a (no public page)" : coverage.internalLinks}
                                </Text>
                              </Stack>
                              {completeness.metadataScore.reasons.length > 0 && (
                                <Text size={1} muted>
                                  Weak: {completeness.metadataScore.reasons.join("; ")}
                                </Text>
                              )}
                              <Button
                                text="Explore relationships"
                                mode="ghost"
                                fontSize={1}
                                onClick={() => {
                                  setTab("explorer");
                                  openExplorer(node);
                                }}
                              />
                            </Stack>
                          </Card>
                        );
                      })}
                    </Grid>
                  </Stack>
                );
              })}
            </Stack>
          </TabPanel>
        )}

        {tab === "gaps" && (
          <TabPanel id="gaps-panel" aria-labelledby="gaps-tab">
            <Stack space={3}>
              <Text muted size={1}>{gaps.length} issues found, most severe first.</Text>
              {gaps
                .sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "high" ? -1 : 1))
                .map((gap, i) => (
                  <Card key={i} padding={3} radius={2} tone={gap.severity === "high" ? "critical" : gap.severity === "medium" ? "caution" : "default"} border>
                    <Flex align="center" justify="space-between">
                      <Text size={1}>{gap.message}</Text>
                      <Badge tone={gap.severity === "high" ? "critical" : gap.severity === "medium" ? "caution" : "default"}>{gap.kind}</Badge>
                    </Flex>
                  </Card>
                ))}
            </Stack>
          </TabPanel>
        )}

        {tab === "explorer" && (
          <TabPanel id="explorer-panel" aria-labelledby="explorer-tab">
            <Grid columns={[1, 1, 2]} gap={3}>
              <Card padding={3} radius={2} border>
                <Stack space={2}>
                  <Heading size={1}>Choose a taxonomy item</Heading>
                  {TAXONOMY_TYPES.map((cfg) => (
                    <Stack key={cfg.type} space={2} paddingTop={2}>
                      <Text size={1} weight="semibold">{cfg.label}</Text>
                      {nodes
                        .filter((n) => n.type === cfg.type)
                        .map((n) => (
                          <Button
                            key={n.id}
                            text={n.name}
                            mode={selectedNodeId === n.id ? "default" : "bleed"}
                            fontSize={1}
                            justify="flex-start"
                            onClick={() => openExplorer(n)}
                          />
                        ))}
                    </Stack>
                  ))}
                </Stack>
              </Card>
              <Card padding={3} radius={2} border>
                {!selectedNodeId && <Text muted size={1}>Select an item to see everything connected to it.</Text>}
                {selectedNodeId && relatedDocs === null && <Spinner muted />}
                {selectedNodeId && relatedDocs && (
                  <Stack space={3}>
                    <Heading size={1}>{nodes.find((n) => n.id === selectedNodeId)?.name}</Heading>
                    {relatedDocs.length === 0 && <Text size={1} muted>No connected documents yet.</Text>}
                    {relatedDocs.map((doc) => (
                      <Card key={`${doc.type}-${doc.id}`} padding={2} radius={2} border>
                        <Flex align="center" justify="space-between">
                          <Text size={1}>{doc.title}</Text>
                          <Flex gap={2} align="center">
                            <Badge mode="outline">{doc.typeLabel}</Badge>
                            <a href={editUrl(doc.type, doc.id)} target="_blank" rel="noreferrer">
                              <Text size={1}>Open →</Text>
                            </a>
                          </Flex>
                        </Flex>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Card>
            </Grid>
          </TabPanel>
        )}

        {tab === "seo" && (
          <TabPanel id="seo-panel" aria-labelledby="seo-tab">
            <Stack space={3}>
              {nodes.map((node) => {
                const seo = seoByNode.get(node.id);
                if (!seo) return null;
                return (
                  <Card key={node.id} padding={3} radius={2} border tone={seo.ok ? "positive" : "caution"}>
                    <Stack space={2}>
                      <Flex align="center" justify="space-between">
                        <Text weight="semibold" size={1}>{node.name} <Text as="span" muted size={1}>({node.typeLabel})</Text></Text>
                        <Badge tone={seo.ok ? "positive" : "caution"}>{seo.ok ? "Ready" : `${seo.issues.length} issue(s)`}</Badge>
                      </Flex>
                      {seo.issues.map((issue, i) => (
                        <Text key={i} size={1} muted>• {issue}</Text>
                      ))}
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          </TabPanel>
        )}

        {tab === "roadmap" && (
          <TabPanel id="roadmap-panel" aria-labelledby="roadmap-tab">
            <Stack space={3}>
              <Text muted size={1}>Ranked by expected SEO and business impact — highest first.</Text>
              {roadmap.slice(0, 25).map((rec: RoadmapRecommendation, i) => (
                <Card key={i} padding={3} radius={2} border>
                  <Flex align="center" justify="space-between">
                    <Text size={1}>
                      <Text as="span" weight="semibold">
                        #{i + 1}
                      </Text>{" "}
                      {rec.message}
                    </Text>
                    <Badge tone={i < 3 ? "critical" : i < 10 ? "caution" : "default"}>impact {rec.impact.toFixed(1)}</Badge>
                  </Flex>
                </Card>
              ))}
            </Stack>
          </TabPanel>
        )}

        {tab === "publish" && (
          <TabPanel id="publish-panel" aria-labelledby="publish-tab">
            <Stack space={4}>
              <Text muted size={1}>
                Pick any two taxonomy items (e.g. a Service and a Location) to check whether that combination has enough real
                tagged proof to justify generating a dedicated page.
              </Text>
              <Flex gap={3} align="center" wrap="wrap">
                <Select value={pubA} onChange={(e) => setPubA(e.currentTarget.value)}>
                  <option value="">Select first item…</option>
                  {TAXONOMY_TYPES.map((cfg) => (
                    <optgroup key={cfg.type} label={cfg.label}>
                      {nodes.filter((n) => n.type === cfg.type).map((n) => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
                <Text size={1}>×</Text>
                <Select value={pubB} onChange={(e) => setPubB(e.currentTarget.value)}>
                  <option value="">Select second item…</option>
                  {TAXONOMY_TYPES.map((cfg) => (
                    <optgroup key={cfg.type} label={cfg.label}>
                      {nodes.filter((n) => n.type === cfg.type).map((n) => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
                <Button text="Check readiness" tone="primary" onClick={runPublishCheck} disabled={!pubA || !pubB || publishLoading} />
              </Flex>

              {publishLoading && <Spinner muted />}

              {publishResult && !publishLoading && (
                <Card padding={4} radius={2} border tone={publishResult.ready ? "positive" : "caution"}>
                  <Stack space={3}>
                    <Heading size={1}>
                      {publishResult.aName} – {publishResult.bName}
                    </Heading>
                    <Stack space={2}>
                      {publishResult.counts.map((c, i) => (
                        <Text key={i} size={1}>
                          {c.met ? "✔" : "✘"} {c.label}: {c.count} {!c.met && `(needs ${c.minimum}+)`}
                        </Text>
                      ))}
                    </Stack>
                    <Box paddingTop={2}>
                      <Badge tone={publishResult.ready ? "positive" : "critical"} fontSize={1} padding={2}>
                        {publishResult.ready ? "Ready for generation" : "Do not generate yet"}
                      </Badge>
                    </Box>
                    {!publishResult.ready && (
                      <Stack space={1}>
                        {publishResult.reasons.map((r, i) => (
                          <Text key={i} size={1} muted>
                            {r}
                          </Text>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              )}
            </Stack>
          </TabPanel>
        )}
      </Stack>
    </Container>
  );
}
