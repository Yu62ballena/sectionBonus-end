"use client";

import { useEffect, useState, useTransition } from "react";
import { extractUrlData } from "../actions/articles/extract-url-data";
import { saveArticle } from "../actions/articles/save-article";
import FormMessage from "./FormMessage";
import { urlRegistrationSchema } from "@/lib/validations/urlRegistrationSchema";
import ToggleSwitch from "./ToggleSwitch";
import { searchKeywordRegistrationSchema } from "@/lib/validations/searchKeywordRegistrationSchema";
import { InputForm } from "./InputForm";
import { getCurrentUserId } from "@/lib/getCurrentUserId";
import { useRouter } from "next/navigation";

function InputFormGroup() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleInput = async (formData: FormData) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const url = formData.get("url") as string;
        const validationResult = urlRegistrationSchema.safeParse({ url });

        if (!validationResult.success) {
          const errorMessage = validationResult.error.issues
            .map((issue) => issue.message)
            .join(",");

          setError(errorMessage);
          return;
        }

        const articleData = await extractUrlData(formData);
        
        if (!articleData) {
          setError("記事データの取得に失敗しました");
          return;
        }

        const userId = await getCurrentUserId();
        const result = await saveArticle(articleData, userId);

        if (!result.success) {
          setError(result.errorMessage || "予期しないエラーが発生しました");
        } else {
          setSuccess("記事を保存しました！");
          
          // フォームをリセット
          const form = document.querySelector("form") as HTMLFormElement;
          if (form) {
            form.reset();
          }
          
          router.refresh();
        }
      } catch (err) {
        console.error(err);
        setError("記事の保存に失敗しました");
      }
    });
  };

  const handleSearch = async (formData: FormData) => {
    setError("");
    
    startTransition(async () => {
      try {
        const keyword = formData.get("keyword") as string;
        const validationResult = searchKeywordRegistrationSchema.safeParse({
          keyword,
        });

        if (!validationResult.success) {
          const errorMessage = validationResult.error.issues
            .map((issue) => issue.message)
            .join(",");

          setError(errorMessage);
          return;
        }

        if (!keyword || keyword.trim() === "") {
          return;
        }

        const redirectUrl = `/?keyword=${encodeURIComponent(keyword)}`;
        router.push(redirectUrl);
      } catch (err) {
        console.error(err);
        setError("検索に失敗しました");
      }
    });
  };

  return (
    <div className="flex gap-3 w-3/5 items-center relative">
      <div className="flex gap-3 items-center w-full">
        {/* トグルスイッチ */}
        <ToggleSwitch
          isRegisterMode={isRegisterMode}
          setIsRegisterMode={setIsRegisterMode}
        />

        {/* インプットフォーム */}
        <InputForm 
          isRegisterMode={isRegisterMode}
          handleInput={handleInput}
          handleSearch={handleSearch}
          isPending={isPending}
        />
      </div>

      {error && <FormMessage error={error} />}
      {success && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-green-50 border border-green-200 rounded-md p-3 shadow-lg z-10">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}
    </div>
  );
}

export default InputFormGroup;