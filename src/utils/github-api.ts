"use server";

import { serverEnv } from "@/config/env/server";
import { AssetResponseSchema, AssetResponseType } from "@/config/github-assets.config";
import { Octokit } from "octokit";

const { GITHUB_TOKEN, ASSETS_REPO_SLUG } = serverEnv;

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function getAssetsFromRepo(chainId: number) {
  try {
    const slug = ASSETS_REPO_SLUG.split("/");
    const [repo] = slug;
    const path = slug.slice(1).join("/").replace("{chainId}", String(chainId));
    const { data } = await octokit.rest.repos.getContent({ repo, path, owner: "magnetar-finance" });

    if ("content" in data) {
      const asBuffer = Buffer.from(data.content, "base64");
      const readable = JSON.parse(asBuffer.toString());
      const { data: value, success, error } = AssetResponseSchema.safeParse(readable);

      if (!success) return Promise.reject(error);
      return value as AssetResponseType;
    }
  } catch (error) {
    return Promise.reject(error);
  }
}
